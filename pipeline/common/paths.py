"""All source and output paths used by the pipeline (plan.md §1, §2).

Every path is overridable through ``config.local.json`` at the project root
(git-ignored). Keys are the lowercase names in ``PATH_KEYS``; values are
strings. Overriding a *root* (e.g. ``wow_root``) re-derives the paths below it
unless those are overridden explicitly too.

The WoW folder is READ ONLY: no phase may write below ``WOW_ROOT``.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, fields
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
CONFIG_FILE = PROJECT_ROOT / "config.local.json"

# Defaults. Override any of them in config.local.json.
_DEFAULT_WOW_ROOT = r"C:\Program Files (x86)\World of Warcraft\_forever_"
# Folder next to the project that holds external checkouts (e.g. QuestieDB).
_DEFAULT_WORKSPACE = str(PROJECT_ROOT.parent)
# Used only when no account folder can be found under WTF/Account.
_DEFAULT_ACCOUNT = "ACCOUNT"


def _default_account(wow_root: Path) -> str:
    """First account folder under WTF/Account (sorted), else the placeholder."""
    base = wow_root / "WTF" / "Account"
    try:
        names = sorted(d.name for d in base.iterdir() if d.is_dir() and d.name != "SavedVariables")
    except OSError:
        names = []
    return names[0] if names else _DEFAULT_ACCOUNT


@dataclass(frozen=True)
class Paths:
    # --- external sources (read only) ---
    wow_root: Path
    addons_dir: Path
    questiedb_dir: Path           # Interface/AddOns/QuestieDB
    questiedb_toc: Path           # QuestieDB_Forever.toc (baked CBOR data)
    questie_dir: Path             # Interface/AddOns/Questie
    wtf_account_dir: Path         # WTF/Account/<account>
    saved_variables_dir: Path     # WTF/Account/<account>/SavedVariables
    gwe_saved_variables: Path     # SavedVariables/GuideWebExport.lua (GuideWebExport addon output)
    # --- workspace (outside the project) ---
    workspace_dir: Path           # parent folder of the project by default
    # --- project ---
    project_root: Path
    data_dir: Path
    build_dir: Path               # data/build
    reports_dir: Path             # data/reports
    web_dir: Path
    web_data_dir: Path            # web/public/data
    web_maps_dir: Path            # web/public/maps
    contracts_dir: Path
    fixtures_dir: Path


PATH_KEYS: tuple[str, ...] = tuple(f.name for f in fields(Paths))


def _derive(over: dict[str, str]) -> Paths:
    def get(key: str, default: Path) -> Path:
        v = over.get(key)
        return Path(v) if v else default

    wow_root = get("wow_root", Path(_DEFAULT_WOW_ROOT))
    addons_dir = get("addons_dir", wow_root / "Interface" / "AddOns")
    questiedb_dir = get("questiedb_dir", addons_dir / "QuestieDB")
    wtf_account_dir = get("wtf_account_dir", wow_root / "WTF" / "Account" / _default_account(wow_root))
    saved_variables_dir = get("saved_variables_dir", wtf_account_dir / "SavedVariables")
    workspace_dir = get("workspace_dir", Path(_DEFAULT_WORKSPACE))
    project_root = get("project_root", PROJECT_ROOT)
    data_dir = get("data_dir", project_root / "data")
    web_dir = get("web_dir", project_root / "web")
    contracts_dir = get("contracts_dir", project_root / "contracts")
    return Paths(
        wow_root=wow_root,
        addons_dir=addons_dir,
        questiedb_dir=questiedb_dir,
        questiedb_toc=get("questiedb_toc", questiedb_dir / "QuestieDB_Forever.toc"),
        questie_dir=get("questie_dir", addons_dir / "Questie"),
        wtf_account_dir=wtf_account_dir,
        saved_variables_dir=saved_variables_dir,
        gwe_saved_variables=get("gwe_saved_variables", saved_variables_dir / "GuideWebExport.lua"),
        workspace_dir=workspace_dir,
        project_root=project_root,
        data_dir=data_dir,
        build_dir=get("build_dir", data_dir / "build"),
        reports_dir=get("reports_dir", data_dir / "reports"),
        web_dir=web_dir,
        web_data_dir=get("web_data_dir", web_dir / "public" / "data"),
        web_maps_dir=get("web_maps_dir", web_dir / "public" / "maps"),
        contracts_dir=contracts_dir,
        fixtures_dir=get("fixtures_dir", contracts_dir / "fixtures"),
    )


def load_paths(config_file: Path | None = None) -> Paths:
    """Build ``Paths`` from defaults plus overrides in ``config_file``
    (default: ``<project>/config.local.json``; missing file = no overrides)."""
    cfg = CONFIG_FILE if config_file is None else Path(config_file)
    over: dict[str, str] = {}
    if cfg.is_file():
        raw = json.loads(cfg.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            raise ValueError(f"{cfg}: expected a JSON object")
        unknown = sorted(set(raw) - set(PATH_KEYS))
        if unknown:
            raise ValueError(f"{cfg}: unknown path keys {unknown}; valid: {list(PATH_KEYS)}")
        over = {k: str(v) for k, v in raw.items()}
    return _derive(over)


def is_inside_wow(path: Path, paths: Paths | None = None) -> bool:
    """True when ``path`` lies inside the (read-only) WoW folder."""
    root = (paths or PATHS).wow_root.resolve()
    try:
        Path(path).resolve().relative_to(root)
        return True
    except ValueError:
        return False


PATHS = load_paths()

# Module-level constants for convenience (``from pipeline.common.paths import QUESTIEDB_TOC``).
WOW_ROOT = PATHS.wow_root
ADDONS_DIR = PATHS.addons_dir
QUESTIEDB_DIR = PATHS.questiedb_dir
QUESTIEDB_TOC = PATHS.questiedb_toc
QUESTIE_DIR = PATHS.questie_dir
WTF_ACCOUNT_DIR = PATHS.wtf_account_dir
SAVED_VARIABLES_DIR = PATHS.saved_variables_dir
GWE_SAVED_VARIABLES = PATHS.gwe_saved_variables
WORKSPACE_DIR = PATHS.workspace_dir
DATA_DIR = PATHS.data_dir
BUILD_DIR = PATHS.build_dir
REPORTS_DIR = PATHS.reports_dir
WEB_DIR = PATHS.web_dir
WEB_DATA_DIR = PATHS.web_data_dir
WEB_MAPS_DIR = PATHS.web_maps_dir
CONTRACTS_DIR = PATHS.contracts_dir
FIXTURES_DIR = PATHS.fixtures_dir
