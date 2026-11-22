"""Audit in-pack prerequisite order in research/dungeons/steps-v2.json.

Walks steps in order for each route (balanced, speedrun). An accept is an
in-pack violation if a prerequisite from content/questie-db is also in this
pack and has not been turned in yet. When a pack quest has an accept step but no turn-in (a Forever quest whose
import has no finisher NPC or object), the accept itself counts as satisfying later accepts. pre.single is any-of (one turned-in or accepted-only member is enough); pre.group is all-of (every in-pack member must already be done).

Out-of-pack prerequisites are listed, not counted as violations.
"""
from __future__ import annotations

import json
import sys
from collections import defaultdict

from paths import STEPS_JSON, QUESTS_JSON, README_MD, DUNGEONS_JSON


ROUTES = ("balanced", "speedrun")


def load():
    steps = json.loads(STEPS_JSON.read_text())["steps"]
    quests = json.loads(QUESTS_JSON.read_text())
    return steps, quests


def pre_of(quests, qid):
    q = quests.get(str(qid)) or {}
    pre = q.get("pre") or {}
    return list(pre.get("single") or []), list(pre.get("group") or [])


def pack_index(steps):
    """quest id -> {accepts, turnins, sections} present in the pack."""
    idx = defaultdict(lambda: {"accepts": [], "turnins": [], "sections": set()})
    for s in steps:
        section = s.get("section")
        sid = s.get("id")
        for a in s.get("actions") or []:
            if a.get("type") not in ("accept", "turnin"):
                continue
            qid = a.get("questId")
            if qid is None:
                continue
            rec = idx[qid]
            rec["sections"].add(section)
            if a["type"] == "accept":
                rec["accepts"].append(sid)
            else:
                rec["turnins"].append(sid)
    return idx


def on_route(step, route):
    routes = step.get("routes")
    if not routes:
        return True
    return route in routes


def quest_meta(quests, qid):
    q = quests.get(str(qid)) or {}
    return {
        "id": qid,
        "name": q.get("name"),
        "zone": q.get("zone"),
        "zoneId": q.get("zoneId"),
        "tag": q.get("tag"),
    }


def audit_route(steps, quests, pack, route):
    turned_in = set()
    accepted = set()
    violations = []
    outside = []
    seen_outside = set()
    for s in steps:
        if not on_route(s, route):
            continue
        # Check accepts in this step against current state, then apply actions in order.
        for a in s.get("actions") or []:
            typ = a.get("type")
            qid = a.get("questId")
            if typ == "accept" and qid is not None:
                single, group = pre_of(quests, qid)
                if str(qid) not in quests and not single and not group:
                    # no record, nothing to check
                    accepted.add(qid)
                    continue
                def member_ok(p):
                    if p not in pack:
                        return False
                    if pack[p]["turnins"]:
                        return p in turned_in
                    return p in accepted  # accept-only (Forever)

                def note_outside(p, kind):
                    key = (qid, p, kind)
                    if key in seen_outside:
                        return
                    seen_outside.add(key)
                    outside.append({
                        "questId": qid,
                        "questName": (quests.get(str(qid)) or {}).get("name"),
                        "prereqId": p,
                        "kind": kind,
                        "section": s.get("section"),
                        "stepId": s.get("id"),
                        **quest_meta(quests, p),
                    })

                # pre.single = any-of. Out-of-pack members can satisfy it outside this pack.
                in_pack_single = [p for p in single if p in pack]
                out_pack_single = [p for p in single if p not in pack]
                for p in out_pack_single:
                    note_outside(p, "single")
                single_ok = True
                unsatisfied_single = []
                if in_pack_single and not out_pack_single:
                    unsatisfied_single = [p for p in in_pack_single if not member_ok(p)]
                    single_ok = any(member_ok(p) for p in in_pack_single)

                # pre.group = all-of. Every in-pack member must already be done.
                in_pack_group = [p for p in group if p in pack]
                for p in (p for p in group if p not in pack):
                    note_outside(p, "group")
                unsatisfied_group = [p for p in in_pack_group if not member_ok(p)]
                group_ok = not unsatisfied_group

                if not single_ok or not group_ok:
                    violations.append({
                        "route": route,
                        "questId": qid,
                        "questName": (quests.get(str(qid)) or {}).get("name"),
                        "section": s.get("section"),
                        "stepId": s.get("id"),
                        "missingSingle": unsatisfied_single if not single_ok else [],
                        "groupUnsatisfied": unsatisfied_group,
                    })
                accepted.add(qid)
            elif typ == "turnin" and qid is not None:
                turned_in.add(qid)
    return violations, outside


def audit(steps=None, quests=None):
    if steps is None or quests is None:
        steps, quests = load()
    pack = pack_index(steps)
    all_violations = []
    outside_by_route = {}
    for route in ROUTES:
        v, o = audit_route(steps, quests, pack, route)
        all_violations.extend(v)
        outside_by_route[route] = o
    # Union of out-of-pack rows (same ids across routes).
    outside = []
    seen = set()
    for route in ROUTES:
        for row in outside_by_route[route]:
            key = (row["questId"], row["prereqId"], row["kind"])
            if key in seen:
                continue
            seen.add(key)
            outside.append(row)
    return {
        "violations": all_violations,
        "outside": outside,
        "packSize": len(pack),
    }


def format_outside_markdown(outside, quests=None):
    lines = [
        "## Prerequisites outside this pack",
        "",
        "These dungeon quests have a `pre.single` (any one) or `pre.group` (all required) prerequisite that is not accepted or turned in inside this pack. The expansion / leveling-route PR is expected to guard them; they are not dropped unless a prerequisite is class-specific or clearly unreachable.",
        "",
    ]
    if not outside:
        lines.append("None.")
        lines.append("")
        return "\n".join(lines)
    lines.append("| Quest | Prereq | Kind | Dungeon section | Prereq zone |")
    lines.append("|---|---|---|---|---|")
    def name_id(qid, fallback):
        n = fallback or ""
        return f"{n} ({qid})".strip() if n else str(qid)
    for row in outside:
        q = name_id(row["questId"], row.get("questName"))
        p = name_id(row["prereqId"], row.get("name"))
        zone = row.get("zone") or (f"zoneId {row['zoneId']}" if row.get("zoneId") else "unknown")
        if row.get("tag"):
            zone = f"{zone} ({row['tag']})"
        missing = " (not in the import)" if row.get("name") is None and not row.get("zone") else ""
        lines.append(
            f"| {q} | {p}{missing} | {row['kind']} | {row.get('section') or ''} | {zone} |"
        )
    lines.append("")
    lines.append("Forever dungeon quests get a turn-in step when QuestieDB provides a finisher NPC or object (`verified: false`). Quests with no finisher in the import stay accept-only; a later accept may then treat that accept as satisfying the prerequisite.")
    lines.append("")
    return "\n".join(lines)


def main():
    result = audit()
    v = result["violations"]
    o = result["outside"]
    print(f"pack quests with accept/turn-in steps: {result['packSize']}")
    print(f"in-pack violations: {len(v)}")
    for row in v:
        miss = row["missingSingle"] or row["groupUnsatisfied"]
        kind = "single" if row["missingSingle"] else "group"
        print(
            f"  [{row['route']}] {row['stepId']} {row['questId']} {row['questName']!r} "
            f"needs {kind} {miss} (section {row['section']})"
        )
    print(f"out-of-pack prerequisites: {len(o)}")
    for row in o:
        print(
            f"  {row['questId']} {row.get('questName')!r} needs {row['kind']} "
            f"{row['prereqId']} {row.get('name')!r} ({row.get('zone') or 'unknown zone'}) "
            f"[{row.get('section')}]"
        )
    if v:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
