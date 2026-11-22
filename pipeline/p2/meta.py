"""Entity field maps parsed from QuestieDB ``src/meta/<entity>Meta.lua`` (never hard-coded)."""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from ..common import lua_table

__all__ = ["EntityMeta", "load_meta", "ENTITIES"]

# TOC entity name → meta file stem
ENTITIES: dict[str, str] = {"Quest": "questMeta", "Npc": "npcMeta", "Object": "objectMeta", "Item": "itemMeta"}


@dataclass(frozen=True)
class EntityMeta:
    entity: str
    field_count: int
    names: dict[int, str]              # fieldIndex → name
    keys: dict[str, int]               # name → fieldIndex
    types: dict[int, str]              # fieldIndex → number|string|table
    structures: dict[int, str] = field(default_factory=dict)
    constant_values: dict[int, object] = field(default_factory=dict)

    @property
    def table_fields(self) -> list[int]:
        return sorted(i for i, t in self.types.items() if t == "table")


def _as_index_map(v: object) -> dict[int, object]:
    return {int(k): x for k, x in lua_table.table_to_dict(v).items()}


def parse_meta(text: str, entity: str) -> EntityMeta:
    names = {k: str(v) for k, v in _as_index_map(lua_table.find_value(text, "names")).items()}
    keys = {str(k): int(v) for k, v in lua_table.table_to_dict(lua_table.find_value(text, "keys")).items()}
    types = {k: str(v) for k, v in _as_index_map(lua_table.find_value(text, "types")).items()}
    structures_v = lua_table.find_all_values(text, "structures")
    consts_v = lua_table.find_all_values(text, "constantValues")
    count = lua_table.find_value(text, "fieldCount")
    meta = EntityMeta(
        entity=entity,
        field_count=int(count),
        names=names,
        keys=keys,
        types=types,
        structures={k: str(v) for k, v in _as_index_map(structures_v[0]).items()} if structures_v else {},
        constant_values=_as_index_map(consts_v[0]) if consts_v else {},
    )
    for name, idx in keys.items():
        if names.get(idx) != name:
            raise ValueError(f"{entity}Meta: keys/names disagree for {name}={idx}")
    return meta


def load_meta(questiedb_dir: Path) -> dict[str, EntityMeta]:
    out = {}
    for entity, stem in ENTITIES.items():
        text = (Path(questiedb_dir) / "src" / "meta" / f"{stem}.lua").read_text(encoding="utf-8")
        out[entity] = parse_meta(text, entity)
    return out
