"""Tiny Lua *data* reader (stdlib only): table constructors, strings, numbers,
booleans and nil — enough for WoW SavedVariables files and Questie's
``[[return { ... }]]`` support tables. It does not evaluate code.

``loads(text)``            -> one Lua value (a leading ``return`` is allowed)
``load_assignments(text)`` -> {name: value} for top-level ``Name = value`` lines

Tables become ``list`` when their keys are exactly 1..n, otherwise ``dict``
(int / float / str / bool keys). ``nil`` values inside tables are dropped,
as in Lua.

P3 owns this copy; P2 may add ``pipeline/common/lua_table.py`` independently.
"""
from __future__ import annotations

import re
from typing import Any

__all__ = ["LuaParseError", "loads", "load_assignments", "as_dict"]


class LuaParseError(ValueError):
    pass


_NAME = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")
_NUM = re.compile(
    r"0[xX][0-9a-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|inf|nan",
)
_ESC = {"n": "\n", "t": "\t", "r": "\r", "a": "\a", "b": "\b", "f": "\f", "v": "\v",
        "\\": "\\", '"': '"', "'": "'", "\n": "\n"}


class _P:
    def __init__(self, s: str) -> None:
        self.s = s
        self.i = 0
        self.n = len(s)

    # ---- lexing helpers ----
    def err(self, what: str) -> LuaParseError:
        line = self.s.count("\n", 0, self.i) + 1
        return LuaParseError(f"{what} at line {line} (offset {self.i}): {self.s[self.i:self.i + 40]!r}")

    def ws(self) -> None:
        s, n = self.s, self.n
        while self.i < n:
            c = s[self.i]
            if c in " \t\r\n﻿":
                self.i += 1
            elif s.startswith("--", self.i):
                j = self.i + 2
                m = re.match(r"\[(=*)\[", s[j:j + 64])
                if m:
                    close = "]" + m.group(1) + "]"
                    k = s.find(close, j + m.end())
                    self.i = n if k < 0 else k + len(close)
                else:
                    k = s.find("\n", j)
                    self.i = n if k < 0 else k + 1
            else:
                break

    def peek(self, tok: str) -> bool:
        self.ws()
        return self.s.startswith(tok, self.i)

    def eat(self, tok: str) -> bool:
        if self.peek(tok):
            self.i += len(tok)
            return True
        return False

    def expect(self, tok: str) -> None:
        if not self.eat(tok):
            raise self.err(f"expected {tok!r}")

    # ---- values ----
    def value(self) -> Any:
        self.ws()
        if self.i >= self.n:
            raise self.err("unexpected end of input")
        c = self.s[self.i]
        if c == "{":
            return self.table()
        if c in "\"'":
            return self.qstring(c)
        if c == "[" and re.match(r"\[=*\[", self.s[self.i:self.i + 64]):
            return self.lstring()
        if c == "-":
            self.i += 1
            v = self.value()
            if not isinstance(v, (int, float)) or isinstance(v, bool):
                raise self.err("unary minus on non-number")
            return -v
        m = _NUM.match(self.s, self.i)
        if m and (c.isdigit() or c == "." or m.group(0) in ("inf", "nan")):
            self.i = m.end()
            t = m.group(0)
            if t == "inf":
                return float("inf")
            if t == "nan":
                return float("nan")
            if t[:2] in ("0x", "0X"):
                return int(t, 16)
            if re.fullmatch(r"\d+", t):
                return int(t)
            return float(t)
        m = _NAME.match(self.s, self.i)
        if m:
            w = m.group(0)
            if w in ("true", "false", "nil"):
                self.i = m.end()
                return {"true": True, "false": False, "nil": None}[w]
        raise self.err("unexpected token")

    def qstring(self, q: str) -> str:
        s, i = self.s, self.i + 1
        out: list[str] = []
        while True:
            if i >= self.n:
                raise self.err("unterminated string")
            c = s[i]
            if c == q:
                self.i = i + 1
                return "".join(out)
            if c == "\\":
                i += 1
                d = s[i] if i < self.n else ""
                if d.isdigit():
                    m = re.match(r"\d{1,3}", s[i:])
                    assert m
                    out.append(chr(int(m.group(0))))
                    i += m.end()
                    continue
                out.append(_ESC.get(d, d))
                i += 1
                continue
            out.append(c)
            i += 1

    def lstring(self) -> str:
        m = re.match(r"\[(=*)\[", self.s[self.i:self.i + 64])
        assert m
        close = "]" + m.group(1) + "]"
        start = self.i + m.end()
        if self.s.startswith("\r\n", start):
            start += 2
        elif self.s.startswith("\n", start):
            start += 1
        k = self.s.find(close, start)
        if k < 0:
            raise self.err("unterminated long string")
        self.i = k + len(close)
        return self.s[start:k]

    def table(self) -> Any:
        self.expect("{")
        d: dict[Any, Any] = {}
        pos = 1
        while True:
            if self.eat("}"):
                break
            self.ws()
            key: Any
            if self.s.startswith("[", self.i) and not re.match(r"\[=*\[", self.s[self.i:self.i + 64]):
                self.i += 1
                key = self.value()
                self.expect("]")
                self.expect("=")
                val = self.value()
                if isinstance(key, float) and key.is_integer():
                    key = int(key)
                if val is not None:
                    d[key] = val
            else:
                m = _NAME.match(self.s, self.i)
                save = self.i
                if m and m.group(0) not in ("true", "false", "nil"):
                    self.i = m.end()
                    if self.eat("=") and not self.peek("="):
                        val = self.value()
                        if val is not None:
                            d[m.group(0)] = val
                    else:
                        self.i = save
                        raise self.err("unexpected name in table")
                else:
                    val = self.value()
                    if val is not None:
                        d[pos] = val
                    pos += 1
            if not (self.eat(",") or self.eat(";")):
                self.expect("}")
                break
        n = len(d)
        if n and all(isinstance(k, int) and not isinstance(k, bool) for k in d) and set(d) == set(range(1, n + 1)):
            return [d[k] for k in range(1, n + 1)]
        if not d:
            return []
        return d


def loads(text: str) -> Any:
    """Parse a single Lua value; an optional leading ``return`` is skipped."""
    p = _P(text)
    p.ws()
    m = _NAME.match(p.s, p.i)
    if m and m.group(0) == "return":
        p.i = m.end()
    v = p.value()
    p.ws()
    if p.i < p.n:
        raise p.err("trailing data")
    return v


def load_assignments(text: str) -> dict[str, Any]:
    """Parse ``Name = value`` statements (WoW SavedVariables layout)."""
    p = _P(text)
    out: dict[str, Any] = {}
    while True:
        p.ws()
        if p.i >= p.n:
            return out
        m = re.compile(r"[A-Za-z_][A-Za-z0-9_.]*").match(p.s, p.i)
        if not m:
            raise p.err("expected an assignment")
        p.i = m.end()
        p.expect("=")
        out[m.group(0)] = p.value()
        p.eat(";")


def as_dict(v: Any) -> dict[Any, Any]:
    """Lua table -> dict with Lua keys (lists become {1: .., 2: ..})."""
    if isinstance(v, dict):
        return v
    if isinstance(v, list):
        return {i + 1: x for i, x in enumerate(v)}
    return {}
