/**
 * Reads route packs from `research/`, in either layout:
 *
 * - **Single file**: a `*.json` whose top level is `{ "schema": "project-forever/route", "version": 2, "steps": [...] }`.
 * - **Segment folder**: a `pack.json` manifest (`"schema": "project-forever/route-manifest"`) holding the pack fields
 *   (`id`, `title`, `levels`, `next`, …) and an ordered `segments` list of file names in the same folder. Each segment
 *   is `{ "schema": "project-forever/route-segment", "pack": "<pack id>", "title": "…", "steps": [...] }`.
 *   Steps in segments leave out `n`: it is the position in the joined pack and is filled in here (1..N).
 *
 * Both layouts give the same `{ schema: "project-forever/route", version: 2, …, steps }` object, so everything
 * downstream (validation, build-data, audits) sees one kind of pack. See docs/ROUTE_FILES.md.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";

export const PACK_SCHEMA = "project-forever/route";
export const MANIFEST_SCHEMA = "project-forever/route-manifest";
export const SEGMENT_SCHEMA = "project-forever/route-segment";
export const MANIFEST_NAME = "pack.json";

/** Folders never searched for packs. */
export const SKIP_DIRS: ReadonlySet<string> = new Set(["tools", "catalog", "node_modules", ".git", "tmp"]);

export interface PackStep {
  id: string;
  n?: number;
  [key: string]: unknown;
}

export interface LoadedPack {
  schema: string;
  version: number;
  id?: string;
  steps: PackStep[];
  [key: string]: unknown;
}

/** Where each step of a segment-folder pack came from (for error messages and tools). */
export interface SegmentInfo {
  file: string;
  title?: string;
  first: number;
  count: number;
}

export interface FoundPack<P = LoadedPack> {
  /** The single pack file, or the folder's `pack.json`. */
  path: string;
  pack: P;
  /** Present for segment-folder packs. */
  segments?: SegmentInfo[];
}

export class RouteSourceError extends Error {
  readonly path: string;
  constructor(message: string, path: string) {
    super(`${path}: ${message}`);
    this.name = "RouteSourceError";
    this.path = path;
  }
}

function readJson(p: string): unknown {
  return JSON.parse(readFileSync(p, "utf-8"));
}

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

export function isPack(v: unknown): v is LoadedPack {
  return isObject(v) && v.schema === PACK_SCHEMA && v.version === 2;
}

export function isManifest(v: unknown): boolean {
  return isObject(v) && v.schema === MANIFEST_SCHEMA;
}

/**
 * Join a segment folder into one pack. `manifestPath` is the folder's `pack.json`.
 * Throws `RouteSourceError` on a missing, unreadable or mislabelled segment, a segment file that is not
 * listed in the manifest, or a manifest that also carries `steps`.
 */
export function loadSegmentedPack(manifestPath: string): FoundPack {
  const dir = dirname(manifestPath);
  let raw: unknown;
  try {
    raw = readJson(manifestPath);
  } catch (e) {
    throw new RouteSourceError(`cannot read manifest: ${(e as Error).message}`, manifestPath);
  }
  if (!isObject(raw) || raw.schema !== MANIFEST_SCHEMA) throw new RouteSourceError(`not a ${MANIFEST_SCHEMA}`, manifestPath);
  const { segments, ...fields } = raw;
  if ("steps" in fields) throw new RouteSourceError("a manifest lists segments; steps belong in the segment files", manifestPath);
  if (!Array.isArray(segments) || segments.length === 0 || !segments.every((s) => typeof s === "string")) {
    throw new RouteSourceError("`segments` must be a non-empty list of file names", manifestPath);
  }
  const listed = new Set<string>();
  for (const s of segments as string[]) {
    if (listed.has(s)) throw new RouteSourceError(`segment ${s} is listed twice`, manifestPath);
    if (s !== basename(s)) throw new RouteSourceError(`segment ${s} must be a file name in the same folder`, manifestPath);
    listed.add(s);
  }
  const unlisted = readdirSync(dir).filter((f) => f.endsWith(".json") && f !== MANIFEST_NAME && !listed.has(f));
  if (unlisted.length) throw new RouteSourceError(`segment files not listed in ${MANIFEST_NAME}: ${unlisted.join(", ")}`, manifestPath);

  const steps: PackStep[] = [];
  const info: SegmentInfo[] = [];
  for (const file of segments as string[]) {
    const p = join(dir, file);
    if (!existsSync(p)) throw new RouteSourceError(`segment ${file} is listed but missing`, manifestPath);
    let seg: unknown;
    try {
      seg = readJson(p);
    } catch (e) {
      throw new RouteSourceError(`cannot read segment: ${(e as Error).message}`, p);
    }
    if (!isObject(seg) || seg.schema !== SEGMENT_SCHEMA) throw new RouteSourceError(`not a ${SEGMENT_SCHEMA}`, p);
    if (seg.pack !== fields.id) throw new RouteSourceError(`segment says pack ${String(seg.pack)}, manifest id is ${String(fields.id)}`, p);
    if (!Array.isArray(seg.steps)) throw new RouteSourceError("`steps` must be a list", p);
    const first = steps.length + 1;
    for (const s of seg.steps as PackStep[]) {
      if (isObject(s) && "n" in s) throw new RouteSourceError(`step ${String(s.id)} has n; leave it out (it is the position, filled in when joined)`, p);
      const { id, ...rest } = s;
      steps.push({ id, n: steps.length + 1, ...rest }); // same key order as a single-file pack
    }
    info.push({ file, title: typeof seg.title === "string" ? seg.title : undefined, first, count: seg.steps.length });
  }
  const pack = { ...fields, schema: PACK_SCHEMA, steps } as LoadedPack;
  return { path: manifestPath, pack, segments: info };
}

/**
 * Every route pack under `dir`, in folder-walk order (names sorted at each level). Single-file packs and segment folders both count.
 * Files inside a segment folder are never read as packs of their own. Unreadable single files are skipped
 * (research folders hold other JSON); a broken segment folder throws.
 */
export function discoverPacks(dir: string, skipDirs: ReadonlySet<string> = SKIP_DIRS): FoundPack[] {
  const out: FoundPack[] = [];
  const walk = (d: string) => {
    const manifest = join(d, MANIFEST_NAME);
    if (existsSync(manifest)) {
      let raw: unknown;
      try {
        raw = readJson(manifest);
      } catch (e) {
        throw new RouteSourceError(`cannot read manifest: ${(e as Error).message}`, manifest);
      }
      if (isManifest(raw)) {
        out.push(loadSegmentedPack(manifest));
        return;
      }
    }
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) {
        if (!skipDirs.has(name)) walk(p);
      } else if (name.endsWith(".json")) {
        let v: unknown;
        try {
          v = readJson(p);
        } catch {
          continue;
        }
        if (isPack(v)) out.push({ path: p, pack: v });
      }
    }
  };
  if (existsSync(dir)) walk(dir);
  return out;
}

/** Load one pack from a single pack file, a `pack.json` manifest, or a segment folder. */
export function loadPack(path: string): FoundPack {
  if (statSync(path).isDirectory()) return loadSegmentedPack(join(path, MANIFEST_NAME));
  const raw = readJson(path);
  if (isManifest(raw)) return loadSegmentedPack(path);
  if (!isPack(raw)) throw new RouteSourceError(`not a ${PACK_SCHEMA} v2 pack or ${MANIFEST_SCHEMA}`, path);
  return { path, pack: raw };
}

/** The segment file that holds pack step `n` (1-based), for messages like "step 42 (02-brill.json)". */
export function segmentOfStep(found: FoundPack, n: number): SegmentInfo | undefined {
  return found.segments?.find((s) => n >= s.first && n < s.first + s.count);
}
