"""Static facts about the vanilla uiMaps (Classic / Forever).

* ``CONTINENT``: uiMapID -> world instance (0 Eastern Kingdoms, 1 Kalimdor).
  Used when the addon export does not say it.
* ``WORLDMAP_FOLDER``: uiMapID -> folder under ``interface/worldmap/`` that holds
  the 12 map tiles ``<Folder>1.blp`` … ``<Folder>12.blp`` (4 × 3 tiles of 256 px,
  the visible map is the top-left 1002 × 668). Names are the vanilla
  WorldMapArea internal names, several of which are misspelt in the game data
  (``Hilsbrad``, ``Ogrimmar``, ``Aszhara``, ``Darnassis``). ``FOLDER_ALIASES``
  lists later spellings that are tried as well.
"""
from __future__ import annotations

CONTINENT_MAPS = {1414: 1, 1415: 0}

_KALIMDOR = [1411, 1412, 1413, 1414, *range(1438, 1453), 1454, 1456, 1457]
_EK = [*range(1415, 1438), 1453, 1455, 1458]
CONTINENT: dict[int, int] = {**{m: 1 for m in _KALIMDOR}, **{m: 0 for m in _EK}}

WORLDMAP_FOLDER: dict[int, str] = {
    1411: "Durotar",
    1412: "Mulgore",
    1413: "Barrens",
    1414: "Kalimdor",
    1415: "Azeroth",
    1416: "Alterac",
    1417: "Arathi",
    1418: "Badlands",
    1419: "BlastedLands",
    1420: "Tirisfal",
    1421: "Silverpine",
    1422: "WesternPlaguelands",
    1423: "EasternPlaguelands",
    1424: "Hilsbrad",
    1425: "Hinterlands",
    1426: "DunMorogh",
    1427: "SearingGorge",
    1428: "BurningSteppes",
    1429: "Elwynn",
    1430: "DeadwindPass",
    1431: "Duskwood",
    1432: "LochModan",
    1433: "Redridge",
    1434: "Stranglethorn",
    1435: "SwampOfSorrows",
    1436: "Westfall",
    1437: "Wetlands",
    1438: "Teldrassil",
    1439: "Darkshore",
    1440: "Ashenvale",
    1441: "ThousandNeedles",
    1442: "StonetalonMountains",
    1443: "Desolace",
    1444: "Feralas",
    1445: "Dustwallow",
    1446: "Tanaris",
    1447: "Aszhara",
    1448: "Felwood",
    1449: "UngoroCrater",
    1450: "Moonglade",
    1451: "Silithus",
    1452: "Winterspring",
    1453: "Stormwind",
    1454: "Ogrimmar",
    1455: "Ironforge",
    1456: "ThunderBluff",
    1457: "Darnassis",
    1458: "Undercity",
}

FOLDER_ALIASES: dict[str, tuple[str, ...]] = {
    "Hilsbrad": ("HillsbradFoothills", "Hillsbrad"),
    "Ogrimmar": ("Orgrimmar",),
    "Darnassis": ("Darnassus",),
    "Barrens": ("TheBarrens", "NorthernBarrens"),
    "Stranglethorn": ("StranglethornVale",),
    "Tirisfal": ("TirisfalGlades",),
    "Silverpine": ("SilverpineForest",),
    "Alterac": ("AlteracMountains",),
    "Arathi": ("ArathiHighlands",),
    "Hinterlands": ("TheHinterlands",),
    "Dustwallow": ("DustwallowMarsh",),
    "Elwynn": ("ElwynnForest",),
    "Redridge": ("RedridgeMountains",),
    "Stormwind": ("StormwindCity",),
    "Aszhara": ("Azshara",),
    "UngoroCrater": ("Ungoro", "UnGoroCrater"),
}


def folder_candidates(map_id: int) -> list[str]:
    f = WORLDMAP_FOLDER.get(map_id)
    if not f:
        return []
    return [f, *FOLDER_ALIASES.get(f, ())]
