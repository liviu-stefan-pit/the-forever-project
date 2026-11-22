"""Minimal CBOR (RFC 8949) reader, enough for the QuestieDB baked TOC.

Moved from ``pipeline/_reference/qdb_probe.py``. Supports unsigned/negative
ints, byte and text strings, arrays, maps, tags (tag number dropped), half /
single / double floats and the simple values false/true/null/undefined.
Indefinite-length items are not used by QuestieDB and raise ``CBORError``.
"""
from __future__ import annotations

import struct
from typing import Any

__all__ = ["CBORError", "loads", "decode_at"]


class CBORError(ValueError):
    pass


def _half(h: int) -> float:
    s = (h >> 15) & 1
    e = (h >> 10) & 31
    f = h & 1023
    if e == 0:
        v = (f / 1024) * 2.0 ** -14
    elif e == 31:
        v = float("nan") if f else float("inf")
    else:
        v = (1 + f / 1024) * 2.0 ** (e - 15)
    return -v if s else v


def _need(b: bytes, i: int, n: int) -> None:
    if i + n > len(b):
        raise CBORError(f"truncated input at offset {i} (need {n} bytes, have {len(b) - i})")


def decode_at(b: bytes, i: int = 0) -> tuple[Any, int]:
    """Decode one CBOR item starting at offset ``i``. Returns ``(value, next_offset)``."""
    _need(b, i, 1)
    ib = b[i]
    mt, ai = ib >> 5, ib & 31
    i += 1

    if ai < 24:
        val = ai
    elif ai == 24:
        _need(b, i, 1)
        val = b[i]
        i += 1
    elif ai == 25:
        _need(b, i, 2)
        val = struct.unpack(">H", b[i:i + 2])[0]
        i += 2
    elif ai == 26:
        _need(b, i, 4)
        if mt == 7:
            return struct.unpack(">f", b[i:i + 4])[0], i + 4
        val = struct.unpack(">I", b[i:i + 4])[0]
        i += 4
    elif ai == 27:
        _need(b, i, 8)
        if mt == 7:
            return struct.unpack(">d", b[i:i + 8])[0], i + 8
        val = struct.unpack(">Q", b[i:i + 8])[0]
        i += 8
    else:
        raise CBORError(f"unsupported additional info {ai} (major type {mt}) at offset {i - 1}")

    if mt == 0:
        return val, i
    if mt == 1:
        return -1 - val, i
    if mt == 2:
        _need(b, i, val)
        return bytes(b[i:i + val]), i + val
    if mt == 3:
        _need(b, i, val)
        return bytes(b[i:i + val]).decode("utf-8", "replace"), i + val
    if mt == 4:
        arr = []
        for _ in range(val):
            x, i = decode_at(b, i)
            arr.append(x)
        return arr, i
    if mt == 5:
        out: dict[Any, Any] = {}
        for _ in range(val):
            k, i = decode_at(b, i)
            x, i = decode_at(b, i)
            if isinstance(k, list):
                k = tuple(k)
            out[k] = x
        return out, i
    if mt == 6:  # tag: ignore the tag number, return the tagged item
        return decode_at(b, i)
    # mt == 7
    if ai == 25:
        return _half(val), i
    simple = {20: False, 21: True, 22: None, 23: None}
    if val in simple:
        return simple[val], i
    raise CBORError(f"unsupported simple value {val} at offset {i}")


def loads(data: bytes, *, strict: bool = False) -> Any:
    """Decode the first CBOR item in ``data``.

    With ``strict=True`` trailing bytes raise ``CBORError``; by default they are
    ignored (matching the probe's behaviour on QuestieDB values).
    """
    value, end = decode_at(bytes(data), 0)
    if strict and end != len(data):
        raise CBORError(f"{len(data) - end} trailing bytes after CBOR item")
    return value
