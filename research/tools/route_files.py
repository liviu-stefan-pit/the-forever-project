"""Read and write route step files from Python research tools.

A route pack is either one `*.json` file (`"schema": "project-forever/route"`) or a segment folder: a
`pack.json` manifest (`"schema": "project-forever/route-manifest"`, ordered `segments` list) plus one
`NN-slug.json` file per segment (`"schema": "project-forever/route-segment"`, with `steps`). See
docs/ROUTE_FILES.md. The web build joins segments with web/scripts/routeSource.ts; this module mirrors it.

    from route_files import iter_packs, iter_step_files, load_pack, write_json, write_pack

    for path, doc in iter_step_files(Path("research/routes")):  # every file that holds steps
        ...edit doc["steps"] in place...
        write_json(path, doc)

    for path, pack in iter_packs(Path("research")):           # joined packs (neighbouring steps visible)
        ...edit pack["steps"][i] in place...
        write_pack(path, pack)                                # back into the right segment files
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Iterator

PACK = "project-forever/route"
MANIFEST = "project-forever/route-manifest"
SEGMENT = "project-forever/route-segment"
MANIFEST_NAME = "pack.json"
SKIP_DIRS = {"tools", "catalog", "node_modules", ".git", "tmp"}


def read_json(path: Path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(path: Path, doc) -> None:
    """Route files use one-space indent, UTF-8 (no \\u escapes) and a trailing newline."""
    Path(path).write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")


def is_step_file(doc) -> bool:
    return isinstance(doc, dict) and doc.get("schema") in (PACK, SEGMENT) and isinstance(doc.get("steps"), list)


def segment_paths(manifest_path: Path) -> list[Path]:
    m = read_json(manifest_path)
    return [Path(manifest_path).parent / s for s in m["segments"]]


def load_pack(path: Path) -> dict:
    """One joined pack (same shape as a single-file pack, `n` filled in) from a pack file, manifest or folder."""
    path = Path(path)
    if path.is_dir():
        path = path / MANIFEST_NAME
    doc = read_json(path)
    if doc.get("schema") == PACK:
        return doc
    if doc.get("schema") != MANIFEST:
        raise ValueError(f"{path}: not a route pack or manifest")
    fields = {k: v for k, v in doc.items() if k != "segments"}
    steps = []
    for seg in segment_paths(path):
        sdoc = read_json(seg)
        if sdoc.get("pack") != fields.get("id"):
            raise ValueError(f"{seg}: segment says pack {sdoc.get('pack')}, manifest id is {fields.get('id')}")
        for s in sdoc["steps"]:
            rest = {k: v for k, v in s.items() if k not in ("id", "n")}
            steps.append({"id": s["id"], "n": len(steps) + 1, **rest})
    return {**fields, "schema": PACK, "steps": steps}


def _format_of(raw: str, doc) -> tuple:
    for ind in (1, 2, None):
        for ea in (False, True):
            s = json.dumps(doc, indent=ind, ensure_ascii=ea)
            for tail in ("\n", ""):
                if s + tail == raw:
                    return ind, ea, tail
    return 1, False, "\n"


def write_pack(path: Path, pack: dict) -> None:
    """Write a joined pack (from `load_pack` / `iter_packs`) back to disk.

    Single-file packs are rewritten whole. For a segment folder, each step goes back to the segment file that
    holds its id, without `n`; the pack's step ids must be the same set as on disk (edit steps in place, or move
    them between segment files by hand). Pack-level fields are not written back to `pack.json`."""
    path = Path(path)
    if path.is_dir():
        path = path / MANIFEST_NAME
    raw = path.read_text(encoding="utf-8")
    doc = json.loads(raw)
    if doc.get("schema") == PACK:
        ind, ea, tail = _format_of(raw, doc)  # keep the file's own formatting (some packs use 2-space indent)
        path.write_text(json.dumps(pack, indent=ind, ensure_ascii=ea) + tail, encoding="utf-8")
        return
    by_id = {s["id"]: s for s in pack["steps"]}
    seen = set()
    for seg in segment_paths(path):
        sdoc = read_json(seg)
        new_steps = []
        for old in sdoc["steps"]:
            if old["id"] not in by_id:
                raise ValueError(f"{seg}: step {old['id']} is not in the pack being written")
            new_steps.append({k: v for k, v in by_id[old["id"]].items() if k != "n"})
            seen.add(old["id"])
        if new_steps != sdoc["steps"]:
            sdoc["steps"] = new_steps
            write_json(seg, sdoc)
    extra = set(by_id) - seen
    if extra:
        raise ValueError(f"{path}: steps not in any segment file: {sorted(extra)[:5]}")


def iter_step_files(root: Path) -> Iterator[tuple[Path, dict]]:
    """Every single-file pack and every segment file under `root`, in walk order (names sorted)."""
    root = Path(root)
    manifest = root / MANIFEST_NAME
    if manifest.exists() and read_json(manifest).get("schema") == MANIFEST:
        for seg in segment_paths(manifest):
            yield seg, read_json(seg)
        return
    for p in sorted(root.iterdir()):
        if p.is_dir():
            if p.name not in SKIP_DIRS:
                yield from iter_step_files(p)
        elif p.suffix == ".json":
            try:
                doc = read_json(p)
            except ValueError:
                continue
            if is_step_file(doc):
                yield p, doc


def iter_packs(root: Path) -> Iterator[tuple[Path, dict]]:
    """Every joined pack under `root`: (pack file or pack.json, pack)."""
    root = Path(root)
    manifest = root / MANIFEST_NAME
    if manifest.exists() and read_json(manifest).get("schema") == MANIFEST:
        yield manifest, load_pack(manifest)
        return
    for p in sorted(root.iterdir()):
        if p.is_dir():
            if p.name not in SKIP_DIRS:
                yield from iter_packs(p)
        elif p.suffix == ".json":
            try:
                doc = read_json(p)
            except ValueError:
                continue
            if isinstance(doc, dict) and doc.get("schema") == PACK and doc.get("version") == 2:
                yield p, doc
