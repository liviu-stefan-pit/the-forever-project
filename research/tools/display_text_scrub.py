"""Keep the data source's product name out of text the site renders.

The site credits its quest data on the Credits page and in each step's `sources[]`; the
display text itself (step text segments, tips, profession hook notes) must not name it.
This rewrites those fields to say "the quest database" instead. It only touches rendered
text fields, never `sources`, ids, order, routes or gotos, and is idempotent. Run it after
any generator that rewrites a route pack:

    python3 research/tools/display_text_scrub.py

The web test `display-text.test.ts` fails the build if the name comes back.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NAME = "Quest" + "ie"  # spelled in two parts so repo-wide greps for display text stay quiet
RULES = [
    (re.compile(rf"our {NAME}DB import"), "our quest database import"),
    (re.compile(rf"{NAME}DB's"), "the quest database's"),
    (re.compile(rf"{NAME}DB(?: v1\.1\.3)?"), "the quest database"),
]
CAP = re.compile(r"(^|[.!?]\s+)the quest database")
TEXT_KEYS = {"t", "text", "note"}


def fix(s: str) -> str:
    for rx, rep in RULES:
        s = rx.sub(rep, s)
    return CAP.sub(lambda m: m.group(1) + "The quest database", s)


def walk(o, changes):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == "sources":
                continue
            if k in TEXT_KEYS and isinstance(v, str) and NAME in v:
                nv = fix(v)
                if nv != v:
                    o[k] = nv
                    changes.append(v)
            else:
                walk(v, changes)
    elif isinstance(o, list):
        for v in o:
            walk(v, changes)


def indent_of(raw: str):
    m = re.search(r"\n( +)\S", raw)
    return len(m.group(1)) if m else None


def main() -> int:
    total = 0
    for p in sorted(ROOT.rglob("*.json")):
        raw = p.read_text(encoding="utf-8")
        if NAME + "DB" not in raw:
            continue
        doc = json.loads(raw)
        is_pack = isinstance(doc, dict) and doc.get("schema") in ("project-forever/route", "project-forever/route-segment") and isinstance(doc.get("steps"), list)
        is_hooks = p.relative_to(ROOT).as_posix() == "professions/profession_hooks.json"
        if not (is_pack or is_hooks):
            continue
        changes = []
        walk(doc["steps"] if is_pack else doc, changes)
        if not changes:
            continue
        out = json.dumps(doc, indent=indent_of(raw), ensure_ascii="\\u" in raw and not re.search(r"[^\x00-\x7f]", raw))
        if raw.endswith("\n"):
            out += "\n"
        p.write_text(out, encoding="utf-8")
        total += len(changes)
        print(f"{p.relative_to(ROOT)}: {len(changes)} field(s)")
    print(f"total: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
