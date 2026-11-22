"""Reader for the QuestieDB baked TOC metadata store (``QuestieDB_Forever.toc``).

Storage format (QuestieDB ``src/read/baked.lua`` + ``src/meta/codec.lua``):

* every value is a ``## X-<key>: <value>`` line;
* ``X-<Entity>-IDS``     base64 → zlib → CBOR array of ids;
* ``X-<Entity>-<id>-S``  base64 → CBOR scalar row: map fieldIndex → value plus key ``p``
  (a presence bitmask: bit ``fieldIndex-1`` set ⇔ table field ``fieldIndex`` is stored).
  A row whose keys happen to be ``1..n`` is encoded as a CBOR *array* (index i → field i+1);
* ``X-<Entity>-<id>-<n>`` base64 → CBOR value of table field ``n``;
* a value ``~N~`` is a chunk header: the real value is ``key-1 … key-N`` concatenated.
"""
from __future__ import annotations

import base64
import zlib
from pathlib import Path
from typing import Any, Iterator

from ..common import cbor

__all__ = ["TocStore", "parse_toc_lines", "reassemble", "decode_row", "PRESENCE_KEY"]

PRESENCE_KEY = "p"


def parse_toc_lines(lines: Iterator[str] | list[str]) -> dict[str, str]:
    """``## X-Key: value`` lines → ``{"X-Key": "value"}`` (other lines ignored)."""
    meta: dict[str, str] = {}
    for line in lines:
        if line.startswith("## X-"):
            k, _, v = line[3:].partition(":")
            meta[k.strip()] = v.strip()
    return meta


def reassemble(meta: dict[str, str], key: str) -> str | None:
    """Stored value for ``key`` with ``~N~`` chunk headers resolved; ``None`` when absent."""
    v = meta.get(key)
    if v is None or not v.startswith("~"):
        return v
    body = v[1:-1] if v.endswith("~") else ""
    if not body.isdigit():
        return v
    parts = []
    for i in range(1, int(body) + 1):
        part = meta.get(f"{key}-{i}")
        if part is None:
            raise KeyError(f"{key} declares {body} chunks but chunk {i} is missing")
        parts.append(part)
    return "".join(parts)


def _text(v: Any) -> Any:
    if isinstance(v, bytes):
        return v.decode("utf-8", "replace")
    return v


def decode_row(raw: Any) -> dict[int | str, Any]:
    """Normalise a decoded scalar row: arrays → ``{1: v, …}``, ``b"p"`` → ``"p"``, bytes → str."""
    if raw is None:
        return {}
    if isinstance(raw, list):
        items = ((i + 1, v) for i, v in enumerate(raw))
    elif isinstance(raw, dict):
        items = raw.items()
    else:
        raise TypeError(f"unexpected scalar row type {type(raw).__name__}")
    row: dict[int | str, Any] = {}
    for k, v in items:
        k = _text(k)
        if v is None:
            continue
        row[k] = _text(v)
    return row


class TocStore:
    """Lazy access to entity rows of the baked TOC."""

    def __init__(self, meta: dict[str, str]) -> None:
        self.meta = meta

    @classmethod
    def load(cls, path: str | Path) -> "TocStore":
        with open(path, encoding="utf-8") as f:
            return cls(parse_toc_lines(f))

    def stored(self, key: str) -> str | None:
        return reassemble(self.meta, key)

    def decode(self, key: str, *, compressed: bool = False) -> Any:
        s = self.stored(key)
        if s is None:
            return None
        raw = base64.b64decode(s)
        if compressed:
            raw = zlib.decompress(raw)
        return cbor.loads(raw)

    def ids(self, entity: str) -> list[int]:
        ids = self.decode(f"X-{entity}-IDS", compressed=True)
        if not isinstance(ids, list):
            raise KeyError(f"X-{entity}-IDS missing or malformed")
        return [int(i) for i in ids]

    def scalar_row(self, entity: str, entity_id: int) -> dict[int | str, Any]:
        return decode_row(self.decode(f"X-{entity}-{entity_id}-S"))

    def table_field(self, entity: str, entity_id: int, field: int) -> Any:
        return self.decode(f"X-{entity}-{entity_id}-{field}")

    def raw_row(self, entity: str, entity_id: int, table_fields: list[int]) -> dict[int, Any]:
        """Scalar row plus every present table field, keyed by field index (raw CBOR values)."""
        row = self.scalar_row(entity, entity_id)
        presence = row.pop(PRESENCE_KEY, 0) or 0
        out: dict[int, Any] = {k: v for k, v in row.items() if isinstance(k, int)}
        for f in table_fields:
            if (int(presence) >> (f - 1)) & 1:
                v = self.table_field(entity, entity_id, f)
                if v is not None:
                    out[f] = v
        return out
