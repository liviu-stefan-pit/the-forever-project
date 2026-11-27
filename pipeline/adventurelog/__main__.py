"""Build tpf-db from AdventureLog logs.

    py -3 -I pipeline/adventurelog --log <AdventureLog.lua | export folder | session.jsonl> [--log …]
        [--zone "Zephras Isle"] [--out content/tpf-db] [--questie content/questie-db] [--check]

Logs are read only. ``--check`` builds in memory and exits 1 when the files on disk differ (for CI).
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from pipeline.adventurelog.db import build_db, read_db, render, write_db  # noqa: E402
from pipeline.adventurelog.reader import read_sources  # noqa: E402


def repo_url(root: Path = _ROOT) -> str:
    """``origin`` as an https URL without ``.git`` (empty when there is no remote)."""
    try:
        raw = subprocess.run(["git", "remote", "get-url", "origin"], cwd=root, capture_output=True, text=True, check=True).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return ""
    if raw.startswith("git@"):
        host, _, path = raw[4:].partition(":")
        raw = f"https://{host}/{path}"
    return raw[:-4] if raw.endswith(".git") else raw


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="pipeline.adventurelog", description=__doc__.split("\n\n")[0])
    ap.add_argument("--log", action="append", required=True, help="AdventureLog.lua, an exporter folder or a .jsonl (repeatable)")
    ap.add_argument("--zone", action="append", default=[], help="zone name whose QuestieDB quests seed unconfirmed/ (repeatable)")
    ap.add_argument("--out", default=str(_ROOT / "content" / "tpf-db"))
    ap.add_argument("--questie", default=str(_ROOT / "content" / "questie-db"))
    ap.add_argument("--repo-url", default=None, help="URL for the credit line (default: git origin as https)")
    ap.add_argument("--check", action="store_true", help="do not write; exit 1 when the output would change")
    a = ap.parse_args(argv)
    out = Path(a.out)
    sessions = read_sources(a.log)
    if not sessions:
        print("no AdventureLog sessions found", file=sys.stderr)
        return 1
    previous = read_db(out)
    url = a.repo_url if a.repo_url is not None else repo_url()
    files = build_db(sessions, Path(a.questie), a.zone, previous=previous, repo_url=url)
    if a.check:
        stale = [n for n in sorted(files) if not (out / n).is_file() or (out / n).read_text(encoding="utf-8") != render(n, files[n])]
        for n in stale:
            print(f"stale: {n}")
        return 1 if stale else 0
    write_db(out, files)
    m = files["meta.json"]
    used = sum(1 for s in m["sessions"] if s["used"])
    print(f"tpf-db: {used}/{len(m['sessions'])} sessions used -> {out}")
    print(f"  confirmed: {m['counts']['confirmed']}")
    print(f"  unconfirmed: {m['counts']['unconfirmed']} ({m['unconfirmedSource']})")
    if m["promoted"]:
        print(f"  promoted (ever): {m['promoted']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
