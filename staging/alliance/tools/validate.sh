#!/usr/bin/env bash
# Validate the staged Alliance packs with the real site build, without touching the site.
#
#   bash staging/alliance/tools/validate.sh [WORKDIR]
#
# Makes a throwaway git worktree (default: $TMPDIR/alliance-validate), swaps in
#   content/questie-db      <- content/questie-db-alliance
#   research/routes         <- staging/alliance/routes (only the Alliance packs)
# and runs the data build (schema, prereq, turn-in and integrity checks) and the XP sim per pack.
# The real checkout is never modified; the worktree is removed at the end unless KEEP=1.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
WT="${1:-${TMPDIR:-/tmp}/alliance-validate}"
cd "$ROOT"
git worktree remove --force "$WT" 2>/dev/null || rm -rf "$WT"
git worktree add --detach "$WT" HEAD >/dev/null
cleanup() { if [ "${KEEP:-0}" != "1" ]; then git -C "$ROOT" worktree remove --force "$WT" >/dev/null 2>&1 || true; fi; }
trap cleanup EXIT

rm -rf "$WT/content/questie-db" "$WT/research/routes"
cp -r "$ROOT/content/questie-db-alliance" "$WT/content/questie-db"
mkdir -p "$WT/research/routes"
cp -r "$ROOT/staging/alliance/routes/." "$WT/research/routes/"
# Horde-only plans that name Horde packs would only add noise; the dungeon plan is optional for the build.
mv "$WT/research/dungeons/integration-plan.json" "$WT/research/dungeons/integration-plan.horde.json" 2>/dev/null || true
ln -s "$ROOT/web/node_modules" "$WT/web/node_modules"

cd "$WT/web"
echo "== build-data"
# The build's whole-chain XP pass is hardwired to the Horde packs (leveling-chain.ts) and stops with
# "missing guide pack durotar-1-12" after the guides are written; schema / prereq / turn-in errors come first.
LOG="$WT/build-data.log"
node --experimental-strip-types scripts/build-data.ts >"$LOG" 2>&1 || true
grep -v "tpf-db vs QuestieDB" "$LOG" | tail -40
if grep -qE "validation failed|Error:|error:" "$LOG" && ! grep -q "missing guide pack durotar" "$LOG"; then
  echo "build-data FAILED"; exit 1
fi
if grep -q "validation failed" "$LOG"; then echo "build-data FAILED"; exit 1; fi
echo "== xp-sim per pack"
for d in "$WT"/research/routes/alliance-1-20/*/; do
  id="$(basename "$d")"
  lvl="$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['levels'][0])" "$d/pack.json")"
  echo "-- $id (enter $lvl)"
  node --experimental-strip-types scripts/xp-sim.ts --only "$id" --enter-level "$lvl" 2>&1 | tail -8 || true
done
