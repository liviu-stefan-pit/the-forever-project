"""Our own Horde 1-20 route (Nova). Text is ours; facts are checked by build_route.py.

Step tuple: (route, action, questId_or_None, {options})
route: 'both' | 'balanced' | 'speedrun'
options: name (Forever-only quests), npcName, at (x,y), lvl, tip, tank, healer, dps, cls{Class: tip},
         hooks [HOOKS key], dungeon, noDungeonAlt, forever, races, classes, also [questIds handled at same stop]

Zone step lists live under tools/spec/. This module re-exports the same public names as before.
"""
from spec.shared import (
    HH, WF, FOREVER_SRC, WH, HOOKS, WM, PROF_TIPS_START, MF_SRC,
    B, Bal, Spd, F, f, ELITE_ZAL,
)
from spec.durotar import DUROTAR
from spec.mulgore import MULGORE
from spec.tirisfal import TIRISFAL
from spec.silverpine import SILVERPINE
from spec.barrens import BARRENS

ZONES_SPEC = [DUROTAR, MULGORE, TIRISFAL, SILVERPINE, BARRENS]
