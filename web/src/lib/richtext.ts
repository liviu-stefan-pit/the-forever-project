/**
 * Rich text → render tokens. Pure, so it is unit-tested without a DOM.
 *
 * A `RichText` line is a list of segments (named colour runs, `|T…|t` textures,
 * links). We turn each into a token the `<RichLine>` component renders:
 * - coloured runs keep their `kind`
 * - `[Item Name]` inside any run becomes an `item` token (rendered bold, like in-game links)
 * - icon segments become a small generic glyph (we have no icon images)
 * - links keep a sanitised `href` (http/https only) and open in a new tab
 */
import type { RichText } from "../data/schema";

export type ColorKind = "friendly" | "warn" | "enemy" | "buy" | "loot" | "pick";
export type IconGlyph = "chat" | "item" | "generic";

export type RichToken =
  | { type: "text"; text: string; kind?: ColorKind }
  | { type: "item"; text: string; kind?: ColorKind }
  | { type: "icon"; glyph: IconGlyph; src: string }
  | { type: "link"; text: string; href?: string };

const COLOR_KINDS = new Set<string>(["friendly", "warn", "enemy", "buy", "loot", "pick"]);

/** Strip WoW escape codes the pipeline might have left in plain text. */
export function cleanEscapes(s: string): string {
  return s
    .replace(/\|c[0-9A-Fa-f]{8}/g, "")
    .replace(/\|r/g, "")
    .replace(/\|T[^|]*\|t/g, "")
    .replace(/\|\|/g, "|");
}

/** Which generic glyph to show for an icon reference (texture path or fileId). */
export function iconGlyph(icon: string | undefined): IconGlyph {
  if (!icon) return "generic";
  if (/chat/i.test(icon)) return "chat";
  if (/^\d+$/.test(icon)) return "item";
  return "generic";
}

/** Only http(s) URLs are allowed as link targets. */
export function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  try {
    const u = new URL(href.trim());
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

const ITEM_RE = /(\[[^\]\n]+\])/;

const tokenizeCache = new WeakMap<RichText, RichToken[]>();

export function tokenizeLine(line: RichText): RichToken[] {
  const cached = tokenizeCache.get(line);
  if (cached) return cached;
  const out: RichToken[] = [];
  for (const seg of line.segments) {
    if (seg.kind === "icon") {
      out.push({ type: "icon", glyph: iconGlyph(seg.icon), src: seg.icon ?? "" });
      if (seg.t) out.push({ type: "text", text: cleanEscapes(seg.t) });
      continue;
    }
    if (seg.kind === "link") {
      const text = cleanEscapes(seg.t) || seg.href || "link";
      out.push({ type: "link", text, href: safeHref(seg.href ?? seg.t) });
      continue;
    }
    const kind = seg.kind && COLOR_KINDS.has(seg.kind) ? (seg.kind as ColorKind) : undefined;
    const text = cleanEscapes(seg.t);
    if (!text) continue;
    for (const part of text.split(ITEM_RE)) {
      if (!part) continue;
      const isItem = part.length > 2 && part.startsWith("[") && part.endsWith("]");
      const tok: RichToken = isItem ? { type: "item", text: part.slice(1, -1) } : { type: "text", text: part };
      if (kind) tok.kind = kind;
      out.push(tok);
    }
  }
  tokenizeCache.set(line, out);
  return out;
}

/** Plain text of a line (for summaries, search and aria labels). */
export function linePlainText(line: RichText): string {
  return tokenizeLine(line)
    .map((t) => (t.type === "icon" ? "" : t.type === "item" ? `[${t.text}]` : t.text))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tailwind classes per colour kind. */
export const KIND_CLASS: Record<ColorKind, string> = {
  friendly: "text-rt-friendly",
  warn: "text-rt-warn",
  enemy: "text-rt-enemy",
  buy: "text-rt-buy",
  loot: "text-rt-loot",
  pick: "text-rt-pick",
};
