"""A small reader for Lua *table literals* (owned by P2, usable by any phase).

It understands the data subset Questie/QuestieDB files use:

* table constructors ``{ a, b, [k] = v, name = v }`` with ``,`` or ``;`` separators
* numbers (decimal, hex, exponent, leading ``-``/``+``), ``true``/``false``/``nil``
* strings: ``"..."``, ``'...'`` with escapes, long strings ``[[...]]`` / ``[==[...]==]``
* comments: ``-- line`` and ``--[[ block ]]`` / ``--[==[ ... ]==]``
* simple arithmetic between numbers: ``a + b``, ``a - b``, ``a * b`` (enough for masks)
* dotted identifiers (``DropKeys.WOWHEAD``, ``zoneIDs.DUROTAR``) resolved through a
  caller-supplied ``names`` mapping; unknown names raise ``LuaParseError`` unless
  ``unknown="none"`` (then they read as ``None``).

Tables become Python values like this:

* only positional items (or keys exactly ``1..n``) → ``list``
* anything else → ``dict`` (integer keys stay ``int``, ``name = v`` keys become ``str``);
  positional items inside a mixed table get keys ``1, 2, …`` like in Lua.
* ``nil`` values are dropped from keyed entries (as Lua does); positional ``nil`` keeps its
  slot so later positions do not shift (it is then a ``dict`` if holes remain).

Entry points: ``parse(text)`` for one expression, ``find_value(text, target)`` for the value
assigned to ``target`` (e.g. ``"QuestXP.db"`` or ``"names"``), ``parse_return_string(s)`` for
the ``[[return { ... }]]`` blobs QuestieDB stores as strings.
"""
from __future__ import annotations

import re
from typing import Any, Mapping

__all__ = ["LuaParseError", "parse", "find_value", "find_all_values", "parse_return_string", "table_to_dict"]


class LuaParseError(ValueError):
    pass


_WS_COMMENT = re.compile(r"(?:\s+|--\[(=*)\[.*?\]\1\]|--[^\n]*)+", re.S)
_NUMBER = re.compile(r"0[xX][0-9a-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?")
_NAME = re.compile(r"[A-Za-z_][A-Za-z0-9_]*(?:\s*\.\s*[A-Za-z_][A-Za-z0-9_]*)*")
_LONG_OPEN = re.compile(r"\[(=*)\[")
_ESCAPES = {"n": "\n", "t": "\t", "r": "\r", "a": "\a", "b": "\b", "f": "\f", "v": "\v",
            "\\": "\\", '"': '"', "'": "'", "\n": "\n"}


class _Parser:
    def __init__(self, text: str, names: Mapping[str, Any] | None, unknown: str) -> None:
        self.s = text
        self.i = 0
        self.names = names or {}
        self.unknown = unknown

    # -- lexing helpers -------------------------------------------------------------------
    def ws(self) -> None:
        m = _WS_COMMENT.match(self.s, self.i)
        if m:
            self.i = m.end()

    def peek(self) -> str:
        self.ws()
        return self.s[self.i:self.i + 1]

    def expect(self, ch: str) -> None:
        if self.peek() != ch:
            raise self.error(f"expected {ch!r}")
        self.i += 1

    def error(self, msg: str) -> LuaParseError:
        line = self.s.count("\n", 0, self.i) + 1
        snippet = self.s[self.i:self.i + 40].replace("\n", "\\n")
        return LuaParseError(f"{msg} at line {line} (offset {self.i}): {snippet!r}")

    # -- grammar --------------------------------------------------------------------------
    def expr(self) -> Any:
        value = self.unary()
        while True:
            op = self.peek()
            if op in ("+", "-", "*") and not self.s.startswith("--", self.i):
                self.i += 1
                rhs = self.unary()
                if not isinstance(value, (int, float)) or not isinstance(rhs, (int, float)):
                    raise self.error(f"arithmetic on non-numbers {value!r} {op} {rhs!r}")
                value = value + rhs if op == "+" else value - rhs if op == "-" else value * rhs
            elif op == "." and self.s.startswith("..", self.i):
                self.i += 2
                rhs = self.unary()
                value = f"{value}{rhs}"
            else:
                return value

    def unary(self) -> Any:
        ch = self.peek()
        if ch == "-" and not self.s.startswith("--", self.i):
            self.i += 1
            v = self.unary()
            if not isinstance(v, (int, float)):
                raise self.error("unary minus on non-number")
            return -v
        if ch == "+":
            self.i += 1
            return self.unary()
        if ch == "(":
            self.i += 1
            v = self.expr()
            self.expect(")")
            return v
        return self.atom()

    def atom(self) -> Any:
        ch = self.peek()
        if ch == "{":
            return self.table()
        if ch in ('"', "'"):
            return self.quoted()
        if ch == "[":
            m = _LONG_OPEN.match(self.s, self.i)
            if m:
                return self.long_string(m)
        if ch.isdigit() or (ch == "." and self.s[self.i + 1:self.i + 2].isdigit()):
            m = _NUMBER.match(self.s, self.i)
            assert m
            self.i = m.end()
            tok = m.group(0)
            if tok[:2] in ("0x", "0X"):
                return int(tok, 16)
            if re.fullmatch(r"\d+", tok):
                return int(tok)
            f = float(tok)
            return int(f) if f.is_integer() and "e" not in tok.lower() and "." not in tok else f
        m = _NAME.match(self.s, self.i)
        if m:
            self.i = m.end()
            name = re.sub(r"\s+", "", m.group(0))
            if name == "true":
                return True
            if name == "false":
                return False
            if name == "nil":
                return None
            if self.peek() == "(":  # function call: only identity-like wrappers, e.g. l10n("x")
                self.i += 1
                arg = self.expr()
                self.expect(")")
                fn = self.names.get(name)
                if callable(fn):
                    return fn(arg)
                if self.unknown == "none":
                    return None
                raise self.error(f"unknown function {name!r}")
            if name in self.names:
                return self.names[name]
            if self.unknown == "none":
                return None
            raise self.error(f"unknown name {name!r}")
        raise self.error("unexpected token")

    def quoted(self) -> str:
        q = self.s[self.i]
        self.i += 1
        out: list[str] = []
        s = self.s
        while True:
            if self.i >= len(s):
                raise self.error("unterminated string")
            c = s[self.i]
            if c == q:
                self.i += 1
                return "".join(out)
            if c == "\\":
                n = s[self.i + 1:self.i + 2]
                if n.isdigit():
                    m = re.match(r"\d{1,3}", s[self.i + 1:])
                    assert m
                    out.append(chr(int(m.group(0))))
                    self.i += 1 + len(m.group(0))
                    continue
                out.append(_ESCAPES.get(n, n))
                self.i += 2
                continue
            if c == "\n":
                raise self.error("newline in string")
            out.append(c)
            self.i += 1

    def long_string(self, m: re.Match[str]) -> str:
        close = "]" + m.group(1) + "]"
        start = m.end()
        end = self.s.find(close, start)
        if end < 0:
            raise self.error("unterminated long string")
        self.i = end + len(close)
        body = self.s[start:end]
        return body[1:] if body.startswith("\n") else body

    def table(self) -> Any:
        self.expect("{")
        pos: list[Any] = []
        keyed: dict[Any, Any] = {}
        while True:
            ch = self.peek()
            if ch == "}":
                self.i += 1
                break
            if ch == "[" and not _LONG_OPEN.match(self.s, self.i):
                self.i += 1
                key = self.expr()
                self.expect("]")
                self.expect("=")
                val = self.expr()
                if isinstance(key, float) and key.is_integer():
                    key = int(key)
                if val is not None:
                    keyed[key] = val
            else:
                m = _NAME.match(self.s, self.i)
                save = self.i
                if m and "." not in m.group(0):
                    self.i = m.end()
                    if self.peek() == "=" and not self.s.startswith("==", self.i):
                        self.i += 1
                        val = self.expr()
                        if val is not None:
                            keyed[m.group(0)] = val
                    else:
                        self.i = save
                        pos.append(self.expr())
                else:
                    pos.append(self.expr())
            sep = self.peek()
            if sep in (",", ";"):
                self.i += 1
            elif sep != "}":
                raise self.error("expected ',' or '}' in table")
        return _build(pos, keyed)


def _build(pos: list[Any], keyed: dict[Any, Any]) -> Any:
    if not keyed:
        if all(v is not None for v in pos):
            return pos
        return {i + 1: v for i, v in enumerate(pos) if v is not None}
    out: dict[Any, Any] = {i + 1: v for i, v in enumerate(pos) if v is not None}
    out.update(keyed)
    n = len(out)
    if n and all(isinstance(k, int) and not isinstance(k, bool) for k in out) and set(out) == set(range(1, n + 1)):
        return [out[k] for k in range(1, n + 1)]
    return out


def parse(text: str, names: Mapping[str, Any] | None = None, *, unknown: str = "error") -> Any:
    """Parse one Lua expression (optionally prefixed by ``return``)."""
    p = _Parser(text, names, unknown)
    p.ws()
    if text.startswith("return", p.i) and not text[p.i + 6:p.i + 7].isalnum():
        p.i += 6
    value = p.expr()
    p.ws()
    if p.i != len(text):
        raise p.error("trailing input after expression")
    return value


def _value_at(text: str, start: int, names: Mapping[str, Any] | None, unknown: str) -> tuple[Any, int]:
    p = _Parser(text, names, unknown)
    p.i = start
    value = p.expr()
    return value, p.i


def find_all_values(text: str, target: str, names: Mapping[str, Any] | None = None, *,
                    unknown: str = "error") -> list[Any]:
    """Every value assigned as ``<target> = <expr>`` (or a table field ``target = <expr>``).

    ``target`` is matched literally on a word boundary, so ``"names"`` finds ``names = {``
    and ``"QuestXP.db"`` finds ``QuestXP.db = {`` but not ``QuestXP.db[5] = …``.
    """
    pat = re.compile(r"(?<![\w.])" + re.escape(target) + r"\s*=(?!=)")
    out = []
    for m in pat.finditer(text):
        # skip matches inside a line comment
        line_start = text.rfind("\n", 0, m.start()) + 1
        if "--" in text[line_start:m.start()]:
            continue
        value, _ = _value_at(text, m.end(), names, unknown)
        out.append(value)
    return out


def find_value(text: str, target: str, names: Mapping[str, Any] | None = None, *, unknown: str = "error") -> Any:
    """The first value assigned to ``target``; ``LuaParseError`` when absent."""
    vals = find_all_values(text, target, names, unknown=unknown)
    if not vals:
        raise LuaParseError(f"no assignment to {target!r} found")
    return vals[0]


def parse_return_string(blob: str, names: Mapping[str, Any] | None = None) -> Any:
    """Parse a ``return { ... }`` chunk stored as a Lua string (QuestieDB support data)."""
    return parse(blob.strip(), names)


def table_to_dict(value: Any) -> dict[Any, Any]:
    """View a parsed table as a dict keyed like Lua (lists become ``{1: a, 2: b}``)."""
    if isinstance(value, dict):
        return value
    if isinstance(value, list):
        return {i + 1: v for i, v in enumerate(value)}
    if value is None:
        return {}
    raise TypeError(f"not a table: {type(value).__name__}")
