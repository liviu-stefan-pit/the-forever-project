/**
 * Split a route-v2 pack into sub-packs from a cut config. From web/:
 *   node --experimental-strip-types scripts/split-pack.ts --config ../research/splits/horde-20-40.json
 *
 * Cross-bracket prefix move: 40-60 pack 0 may start after source[0] (remainder only).
 * 20-40 `appendFrom` copies [0, untilStepId) from the 40-60 catalog onto the last pack.
 * Run 40-60 then 20-40 so `unionWith` can see the remainder packs.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

interface RouteStep {
  id: string;
  [key: string]: unknown;
}

interface RoutePack {
  schema?: unknown;
  version?: unknown;
  id?: string;
  title?: string;
  levels?: unknown;
  steps: RouteStep[];
  [key: string]: unknown;
}

interface SplitPackSpec {
  slug: string;
  title: string;
  levels: [number, number];
  bracket: string;
  next?: string;
  firstStepId: string;
  notes?: string;
}

interface AppendFrom {
  source: string;
  /** Exclusive: first remaining 40-60 step (new cut). Prefix is source[0, untilStepId). */
  untilStepId: string;
}

interface SplitConfig {
  source: string;
  outDir: string;
  packs: SplitPackSpec[];
  appendFrom?: AppendFrom;
  /** Sibling split config. After write, assert 16-pack union vs both catalog sources. */
  unionWith?: string;
}

function readJson<T>(p: string): T {
  return JSON.parse(readFileSync(p, "utf-8")) as T;
}

function flagValue(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : undefined;
}

/** Prefer cwd (so `web/` invocations work), then repo root. */
function resolveExisting(p: string): string {
  if (isAbsolute(p)) return p;
  const fromCwd = resolve(process.cwd(), p);
  if (existsSync(fromCwd)) return fromCwd;
  return resolve(ROOT, p);
}

function resolveFromRoot(p: string): string {
  if (isAbsolute(p)) return p;
  return resolve(ROOT, p);
}

function stepIds(steps: readonly RouteStep[]): string[] {
  return steps.map((s) => s.id);
}

function assertIdSeq(actual: readonly string[], expected: readonly string[], label: string): void {
  if (actual.length !== expected.length || actual.some((id, i) => id !== expected[i])) {
    throw new Error(`split-pack: ${label}`);
  }
}

function assertStepObjects(actual: readonly RouteStep[], expected: readonly RouteStep[], ids: readonly string[], label: string): void {
  for (let i = 0; i < expected.length; i++) {
    if (JSON.stringify(actual[i]) !== JSON.stringify(expected[i])) {
      throw new Error(`split-pack: ${label} at index ${i} (${ids[i]})`);
    }
  }
}

function loadPrefix(appendFrom: AppendFrom): { extraSource: RoutePack; prefix: RouteStep[]; untilIdx: number } {
  const extraPath = resolveFromRoot(appendFrom.source);
  if (!existsSync(extraPath)) throw new Error(`split-pack: appendFrom source not found: ${extraPath}`);
  const extraSource = readJson<RoutePack>(extraPath);
  const extraSteps = extraSource.steps;
  if (!Array.isArray(extraSteps) || extraSteps.length === 0) {
    throw new Error("split-pack: appendFrom source has no steps");
  }
  const untilIdx = extraSteps.findIndex((s) => s.id === appendFrom.untilStepId);
  if (untilIdx < 0) throw new Error(`split-pack: appendFrom untilStepId missing: ${appendFrom.untilStepId}`);
  if (untilIdx === 0) throw new Error(`split-pack: appendFrom untilStepId is the extra source first step (empty prefix)`);
  return { extraSource, prefix: extraSteps.slice(0, untilIdx), untilIdx };
}

export function splitPack(
  source: RoutePack,
  specs: SplitPackSpec[],
  opts?: { append?: readonly RouteStep[] },
): RoutePack[] {
  const steps = source.steps;
  if (!Array.isArray(steps) || steps.length === 0) throw new Error("split-pack: source has no steps");
  if (!specs.length) throw new Error("split-pack: config has no packs");
  const firstSource = steps[0];
  if (!firstSource) throw new Error("split-pack: source has no steps");

  const idToIndex = new Map<string, number>();
  for (let i = 0; i < steps.length; i++) {
    const id = steps[i]?.id;
    if (typeof id !== "string" || !id) throw new Error(`split-pack: step at index ${i} has no id`);
    if (idToIndex.has(id)) throw new Error(`split-pack: duplicate step id ${id}`);
    idToIndex.set(id, i);
  }

  const cuts: number[] = [];
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    if (!spec?.slug || !spec.firstStepId) throw new Error(`split-pack: pack ${i} missing slug or firstStepId`);
    const idx = idToIndex.get(spec.firstStepId);
    if (idx == null) throw new Error(`split-pack: firstStepId missing: ${spec.firstStepId}`);
    if (i === 0 && idx !== 0) {
      console.log(`[split-pack] pack 0 starts at source index ${idx} (${spec.firstStepId}); skipping ${idx} prefix steps`);
    }
    if (i > 0 && !(idx > cuts[i - 1]!)) {
      throw new Error(
        `split-pack: cuts are not strictly increasing in source order (${specs[i - 1]!.firstStepId} -> ${spec.firstStepId})`,
      );
    }
    cuts.push(idx);
  }

  const { steps: _ignored, ...packFields } = source;
  const out: RoutePack[] = [];
  const concatIds: string[] = [];
  const append = opts?.append ?? [];

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i]!;
    const start = cuts[i]!;
    const end = i + 1 < specs.length ? cuts[i + 1]! : steps.length;
    const slice = i === specs.length - 1 && append.length ? [...steps.slice(start, end), ...append] : steps.slice(start, end);
    if (!slice.length) throw new Error(`split-pack: pack ${spec.slug} has no steps`);

    const pack: RoutePack = {
      ...packFields,
      id: spec.slug,
      title: spec.title,
      levels: spec.levels,
      steps: slice,
      bracket: spec.bracket,
    };
    if (spec.next) pack.next = spec.next;
    else delete pack.next;

    out.push(pack);
    for (const step of slice) concatIds.push(step.id);
    console.log(`${spec.slug} ${slice.length} ${slice[0]!.id} ${slice.at(-1)!.id}`);
  }

  const expectedIds = [...stepIds(steps.slice(cuts[0])), ...stepIds(append)];
  if (concatIds.length !== expectedIds.length || concatIds.some((id, i) => id !== expectedIds[i])) {
    throw new Error("split-pack: concatenated sub-pack step ids !== source remainder + append prefix");
  }
  const seen = new Set<string>();
  for (const id of concatIds) {
    if (seen.has(id)) throw new Error(`split-pack: duplicate step id across packs: ${id}`);
    seen.add(id);
  }
  return out;
}

function writtenPacks(cfg: SplitConfig): RoutePack[] {
  const outDir = resolveFromRoot(cfg.outDir);
  return cfg.packs.map((spec) => {
    const p = join(outDir, `${spec.slug}.json`);
    if (!existsSync(p)) throw new Error(`split-pack: missing sibling pack ${p}`);
    return readJson<RoutePack>(p);
  });
}

function assertPairUnion(thisPath: string, thisCfg: SplitConfig, thisSource: RoutePack, thisWritten: RoutePack[]): void {
  if (!thisCfg.unionWith) return;
  const siblingResolved = resolveExisting(thisCfg.unionWith);
  if (!existsSync(siblingResolved)) throw new Error(`split-pack: unionWith config not found: ${thisCfg.unionWith}`);
  const siblingCfg = readJson<SplitConfig>(siblingResolved);
  const siblingSource = readJson<RoutePack>(resolveFromRoot(siblingCfg.source));
  const siblingWritten = writtenPacks(siblingCfg);

  const thisHasAppend = !!thisCfg.appendFrom;
  const siblingHasAppend = !!siblingCfg.appendFrom;
  if (thisHasAppend === siblingHasAppend) {
    throw new Error("split-pack: unionWith pair needs exactly one appendFrom (the 20-40 config)");
  }

  const twenty = thisHasAppend
    ? { cfg: thisCfg, source: thisSource, written: thisWritten, path: thisPath }
    : { cfg: siblingCfg, source: siblingSource, written: siblingWritten, path: siblingResolved };
  const forty = thisHasAppend
    ? { cfg: siblingCfg, source: siblingSource, written: siblingWritten, path: siblingResolved }
    : { cfg: thisCfg, source: thisSource, written: thisWritten, path: thisPath };

  const appendFrom = twenty.cfg.appendFrom;
  if (!appendFrom) throw new Error("split-pack: 20-40 config missing appendFrom");
  if (appendFrom.untilStepId !== forty.cfg.packs[0]?.firstStepId) {
    throw new Error(
      `split-pack: appendFrom.untilStepId (${appendFrom.untilStepId}) !== 40-60 pack 0 firstStepId (${forty.cfg.packs[0]?.firstStepId})`,
    );
  }

  const extraPath = resolveFromRoot(appendFrom.source);
  const extraSource = extraPath === resolveFromRoot(forty.cfg.source) ? forty.source : readJson<RoutePack>(extraPath);
  const untilIdx = extraSource.steps.findIndex((s) => s.id === appendFrom.untilStepId);
  if (untilIdx <= 0) throw new Error(`split-pack: union untilStepId missing or empty prefix: ${appendFrom.untilStepId}`);
  const prefix = extraSource.steps.slice(0, untilIdx);
  const remainder = extraSource.steps.slice(untilIdx);

  const twentyIds = twenty.written.flatMap((p) => stepIds(p.steps));
  const fortyIds = forty.written.flatMap((p) => stepIds(p.steps));
  const expected20 = [...stepIds(twenty.source.steps), ...stepIds(prefix)];
  const expected40 = stepIds(remainder);
  assertIdSeq(twentyIds, expected20, "20-40 packs !== catalog-20-40 steps + moved prefix");
  assertIdSeq(fortyIds, expected40, "40-60 packs !== 40-60 catalog remainder");

  const allIds = [...twentyIds, ...fortyIds];
  const sourceUnion = [...stepIds(twenty.source.steps), ...stepIds(extraSource.steps)];
  if (new Set(allIds).size !== allIds.length) throw new Error("split-pack: duplicate step id in the 16-pack union");
  if (new Set(sourceUnion).size !== sourceUnion.length) throw new Error("split-pack: duplicate step id across catalog sources");
  if (allIds.length !== sourceUnion.length) {
    throw new Error(
      `split-pack: 16-pack union length ${allIds.length} !== both catalog sources ${sourceUnion.length}`,
    );
  }
  const sourceSet = new Set(sourceUnion);
  for (const id of allIds) {
    if (!sourceSet.has(id)) throw new Error(`split-pack: pack step id not in either catalog: ${id}`);
  }
  const packSet = new Set(allIds);
  for (const id of sourceUnion) {
    if (!packSet.has(id)) throw new Error(`split-pack: catalog step id missing from 16 packs: ${id}`);
  }

  const packCount = twenty.written.length + forty.written.length;
  if (packCount !== 16) throw new Error(`split-pack: expected 16 packs, got ${packCount}`);
  console.log(`[split-pack] union ok: ${packCount} packs, ${allIds.length} steps (prefix ${prefix.length})`);
}

export function runSplit(configPath: string): { outDir: string; slugs: string[] } {
  const cfg = readJson<SplitConfig>(configPath);
  if (!cfg?.source || !cfg.outDir || !Array.isArray(cfg.packs)) {
    throw new Error("split-pack: config needs source, outDir, and packs");
  }
  const sourcePath = resolveFromRoot(cfg.source);
  if (!existsSync(sourcePath)) throw new Error(`split-pack: source not found: ${sourcePath}`);
  const source = readJson<RoutePack>(sourcePath);

  let append: RouteStep[] | undefined;
  let extraSource: RoutePack | undefined;
  if (cfg.appendFrom) {
    const loaded = loadPrefix(cfg.appendFrom);
    extraSource = loaded.extraSource;
    append = loaded.prefix;
    console.log(
      `[split-pack] appending ${append.length} steps from ${cfg.appendFrom.source} through ${append.at(-1)!.id} (until ${cfg.appendFrom.untilStepId})`,
    );
  }

  const packs = splitPack(source, cfg.packs, { append });
  const outDir = resolveFromRoot(cfg.outDir);
  mkdirSync(outDir, { recursive: true });

  const written: RoutePack[] = [];
  for (const pack of packs) {
    const outPath = join(outDir, `${pack.id}.json`);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, `${JSON.stringify(pack, null, 2)}\n`);
    written.push(readJson<RoutePack>(outPath));
  }

  const skip = (() => {
    const firstId = cfg.packs[0]?.firstStepId;
    const idx = source.steps.findIndex((s) => s.id === firstId);
    return idx < 0 ? 0 : idx;
  })();
  const expectedSteps = [...source.steps.slice(skip), ...(append ?? [])];
  const unionSteps = written.flatMap((p) => p.steps);
  assertIdSeq(stepIds(unionSteps), stepIds(expectedSteps), "written sub-pack step ids !== source remainder + append prefix");
  assertStepObjects(unionSteps, expectedSteps, stepIds(expectedSteps), "step object rewritten");
  if (append && extraSource) {
    const last = written.at(-1);
    if (!last) throw new Error("split-pack: no packs written");
    const tail = last.steps.slice(last.steps.length - append.length);
    assertIdSeq(stepIds(tail), stepIds(append), "last pack tail !== moved 40-60 prefix");
    assertStepObjects(tail, append, stepIds(append), "appended prefix step object rewritten");
  }

  if (cfg.unionWith) assertPairUnion(configPath, cfg, source, written);

  return { outDir, slugs: packs.map((p) => String(p.id)) };
}

function main(argv: string[]): number {
  const configArg = flagValue(argv, "--config");
  if (!configArg) {
    console.error("[split-pack] usage: --config <path>");
    return 1;
  }
  try {
    const configPath = resolveExisting(configArg);
    if (!existsSync(configPath)) throw new Error(`config not found: ${configPath}`);
    const r = runSplit(configPath);
    console.log(`[split-pack] wrote ${r.slugs.length} packs → ${relative(ROOT, r.outDir)}`);
    return 0;
  } catch (e) {
    console.error(`[split-pack] ${(e as Error).message}`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
