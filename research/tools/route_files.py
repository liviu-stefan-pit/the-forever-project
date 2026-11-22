"""Read and write route step files from Python research tools.

A route pack is either one `*.json` file (`"schema": "project-forever/route"`) or a segment folder: a
`pack.json` manifest (`"schema": "project-forever/route-manifest"`, ordered `segments` list) plus one
`NN-slug.json` file per segment (`"schema": "project-forever/route-segment"`, with `steps`). See
docs/ROUTE_FILES.md. The web build joins segments with web/scripts/routeSource.ts; this module mirrors it.

    from route_files import iter_step_files, load_pack, write_json

    for path, doc in iter_step_files(Path("research/routes")):  # every file that holds steps
        ...edit doc["steps"] in place...
        write_json(path, doc)
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
