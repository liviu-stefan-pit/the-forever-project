"""Repo-relative paths for the dungeon research tools."""
from pathlib import Path

TOOL_DIR = Path(__file__).resolve().parent
DDIR = TOOL_DIR.parent
ROOT = DDIR.parent.parent

DUNGEONS_JSON = DDIR / "dungeons.json"
STEPS_JSON = DDIR / "steps-v2.json"
README_MD = DDIR / "README.md"
QUESTIE_DIR = ROOT / "content" / "questie-db"
QUESTS_JSON = QUESTIE_DIR / "quests.json"
NPCS_JSON = QUESTIE_DIR / "npcs.json"
OBJECTS_JSON = QUESTIE_DIR / "objects.json"
ITEMS_JSON = QUESTIE_DIR / "items.json"
ZONES_JSON = QUESTIE_DIR / "zones.json"
