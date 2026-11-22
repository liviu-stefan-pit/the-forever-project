"""Repo-relative paths for the dungeon research tools."""
from pathlib import Path

TOOL_DIR = Path(__file__).resolve().parent
DDIR = TOOL_DIR.parent
ROOT = DDIR.parent.parent

DUNGEONS_JSON = DDIR / "dungeons.json"
# The dungeons route pack: a segment folder (pack.json + one file per dungeon), see docs/ROUTE_FILES.md.
# Read it with route_files.load_pack(STEPS_PACK).
STEPS_PACK = ROOT / "research" / "routes" / "dungeons" / "horde-dungeons-15-60"
README_MD = DDIR / "README.md"
QUESTIE_DIR = ROOT / "content" / "questie-db"
QUESTS_JSON = QUESTIE_DIR / "quests.json"
NPCS_JSON = QUESTIE_DIR / "npcs.json"
OBJECTS_JSON = QUESTIE_DIR / "objects.json"
ITEMS_JSON = QUESTIE_DIR / "items.json"
ZONES_JSON = QUESTIE_DIR / "zones.json"

import sys as _sys  # noqa: E402
_sys.path.insert(0, str(ROOT / "research" / "tools"))
