"""Run the data pipeline phases in order.

Only P2 (local QuestieDB decode) remains. The old P1 guide importer and the P3/P4/P5 phases that
calibrated maps from and enriched third-party guide files were removed; site data is now built from
``research/`` route packs and ``content/questie-db`` (see web/scripts/build-data.ts once merged).

    python -I pipeline/build_all.py [--verbose] [--only p2,p3] [--stop-on-error]

Phase contract: each phase is a module ``pipeline/<name>.py`` exposing
``main(argv: list[str] | None = None) -> int`` (0 = success). Missing phase
modules are skipped with a message. ``--verbose`` is forwarded to each phase.
"""
from __future__ import annotations

import argparse
import importlib
import sys
import time
from pathlib import Path

# `python -I` does not put the script dir or cwd on sys.path: add the project root.
_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

PHASES: tuple[str, ...] = ("p2_questie",)


def run(names: list[str], verbose: bool, stop_on_error: bool) -> int:
    failures = 0
    for name in names:
        module_file = _ROOT / "pipeline" / f"{name}.py"
        if not module_file.is_file():
            print(f"[skip] {name}: pipeline/{name}.py not present yet")
            continue
        mod = importlib.import_module(f"pipeline.{name}")
        entry = getattr(mod, "main", None)
        if not callable(entry):
            print(f"[skip] {name}: no main(argv) function")
            continue
        print(f"[run ] {name}")
        t0 = time.perf_counter()
        try:
            rc = entry(["--verbose"] if verbose else [])
        except SystemExit as e:  # phases may use argparse / sys.exit
            rc = e.code if isinstance(e.code, int) else (0 if e.code is None else 1)
        rc = 0 if rc is None else int(rc)
        dt = time.perf_counter() - t0
        if rc == 0:
            print(f"[ ok ] {name} ({dt:.1f}s)")
        else:
            failures += 1
            print(f"[FAIL] {name} exited with {rc} ({dt:.1f}s)")
            if stop_on_error:
                return rc
    return 1 if failures else 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--verbose", action="store_true", help="forward --verbose to every phase")
    ap.add_argument("--only", default="", help="comma-separated subset, e.g. p1,p3 or p2_questie")
    ap.add_argument("--stop-on-error", action="store_true", help="stop at the first failing phase")
    args = ap.parse_args(argv)

    names = list(PHASES)
    if args.only:
        wanted = [w.strip() for w in args.only.split(",") if w.strip()]
        names = [n for n in PHASES if any(n == w or n.split("_")[0] == w for w in wanted)]
        if not names:
            ap.error(f"--only {args.only!r} matches none of {', '.join(PHASES)}")
    return run(names, args.verbose, args.stop_on_error)


if __name__ == "__main__":
    sys.exit(main())
