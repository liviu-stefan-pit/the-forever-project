/**
 * Move a profile to another device with a link (shown as a QR code). No server: the profile travels
 * inside the link's hash. To fit a QR code it is packed tight:
 *
 * - done / skipped steps as two bitsets over every step id in `guide_index.json` (both devices
 *   must have the same data build: `build` carries the index's `generatedAt`);
 * - quest states as delta-encoded sorted id lists;
 * - the whole thing JSON → deflate-raw → base64url.
 *
 * Steps outside the index (none today) and per-step timestamps are not carried.
 */
import type { GuideIndex, Profile } from "../data/schema";

export interface TransferPayload {
  v: 1;
  build: string;
  name: string;
  race: string;
  cls: string;
  level?: number;
  role?: string;
  prof?: string[];
  route: string;
  opt: { o: 0 | 1; h: 0 | 1; d: 0 | 1 };
  cur?: [string, string];
  /** Hex bitsets over the index's step ids. */
  done: string;
  skip: string;
  /** Delta-encoded sorted quest ids per state. */
  qd: string;
  qa: string;
  qs: string;
  added: string;
}

/** Every step id in the index, in index order (the bitset positions). */
export function indexStepIds(index: GuideIndex): string[] {
  return (index.entries ?? []).flatMap((e) => e.stepIds);
}

function toHexBits(ids: readonly string[], has: (id: string) => boolean): string {
  const bytes = new Uint8Array(Math.ceil(ids.length / 8));
  ids.forEach((id, i) => {
    if (has(id)) bytes[i >> 3]! |= 1 << (i & 7);
  });
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex.replace(/(00)+$/, "");
}

function fromHexBits(ids: readonly string[], hex: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < ids.length; i++) {
    const byte = parseInt(hex.slice((i >> 3) * 2, (i >> 3) * 2 + 2) || "00", 16);
    if (byte & (1 << (i & 7))) out.push(ids[i]!);
  }
  return out;
}

function deltaEncode(nums: readonly number[]): string {
  const s = [...new Set(nums)].filter((n) => Number.isInteger(n) && n > 0).sort((a, b) => a - b);
  let prev = 0;
  return s
    .map((n) => {
      const d = n - prev;
      prev = n;
      return d.toString(36);
    })
    .join(".");
}

function deltaDecode(s: string): number[] {
  if (!s) return [];
  let prev = 0;
  return s.split(".").map((p) => (prev += parseInt(p, 36)));
}

export function buildPayload(profile: Profile, index: GuideIndex): TransferPayload {
  const ids = indexStepIds(index);
  const st = profile.steps;
  const byState = (want: "done" | "accepted" | "skipped") =>
    Object.entries(profile.quests)
      .filter(([, v]) => v === want)
      .map(([k]) => Number(k));
  return {
    v: 1,
    build: index.generatedAt,
    name: profile.name,
    race: profile.race,
    cls: profile.cls,
    ...(profile.level ? { level: profile.level } : {}),
    ...(profile.role ? { role: profile.role } : {}),
    ...(profile.professions?.length ? { prof: profile.professions } : {}),
    route: profile.routeStyle,
    opt: { o: profile.options.showOptional ? 1 : 0, h: profile.options.hideDone ? 1 : 0, d: profile.options.dungeons ? 1 : 0 },
    ...(profile.current ? { cur: [profile.current.guide, profile.current.step] as [string, string] } : {}),
    done: toHexBits(ids, (id) => !!st[id] && "done" in st[id]!),
    skip: toHexBits(ids, (id) => !!st[id] && "skipped" in st[id]!),
    qd: deltaEncode(byState("done")),
    qa: deltaEncode(byState("accepted")),
    qs: deltaEncode(byState("skipped")),
    added: deltaEncode(profile.addedQuests),
  };
}

/** A profile JSON (the shape `importParsed` takes) rebuilt from a payload. */
export function payloadToProfileJson(p: TransferPayload, index: GuideIndex, now: number): string {
  const ids = indexStepIds(index);
  const steps: Profile["steps"] = {};
  for (const id of fromHexBits(ids, p.done)) steps[id] = { done: true, at: now };
  for (const id of fromHexBits(ids, p.skip)) steps[id] = { skipped: true, at: now };
  const quests: Profile["quests"] = {};
  for (const id of deltaDecode(p.qd)) quests[id] = "done";
  for (const id of deltaDecode(p.qa)) quests[id] = "accepted";
  for (const id of deltaDecode(p.qs)) quests[id] = "skipped";
  return JSON.stringify({
    name: p.name,
    race: p.race,
    cls: p.cls,
    level: p.level,
    role: p.role,
    professions: p.prof,
    routeStyle: p.route,
    options: { showOptional: !!p.opt.o, hideDone: !!p.opt.h, dungeons: !!p.opt.d },
    steps,
    quests,
    addedQuests: deltaDecode(p.added),
    current: p.cur ? { guide: p.cur[0], step: p.cur[1] } : undefined,
  });
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

export async function encodePayload(p: TransferPayload): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(p));
  return toBase64Url(await pipe(json, new CompressionStream("deflate-raw")));
}

export async function decodePayload(code: string): Promise<TransferPayload> {
  const json = new TextDecoder().decode(await pipe(fromBase64Url(code), new DecompressionStream("deflate-raw")));
  const p = JSON.parse(json) as TransferPayload;
  if (p?.v !== 1 || typeof p.name !== "string" || typeof p.done !== "string") throw new Error("This transfer link is not valid.");
  return p;
}

/** Longest link we put in a QR code (version 40, low error correction, byte mode holds 2,953). */
export const MAX_QR_URL = 2800;
