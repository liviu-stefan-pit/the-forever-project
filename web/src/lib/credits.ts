/**
 * Parser for the root `CREDITS.md` (owned by Sentinel). Only the markdown table between
 * `<!-- sources:start -->` and `<!-- sources:end -->` is read, columns
 * Name | URL | Licence | Used for | Files. The "not affiliated" line is read from the prose.
 */
export interface CreditRow {
  name: string;
  url: string;
  licence: string;
  usedFor: string;
  files: string;
}

export interface Credits {
  sources: CreditRow[];
  /** The "not affiliated with Blizzard" sentence(s), if present. */
  notice?: string;
}

const START = "<!-- sources:start -->";
const END = "<!-- sources:end -->";

/** Split one table row on unescaped pipes; trims the outer pipes and cells. */
function cells(line: string): string[] {
  let t = line.trim();
  if (t.startsWith("|")) t = t.slice(1);
  if (t.endsWith("|") && !t.endsWith("\\|")) t = t.slice(0, -1);
  return t.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
}

const isSeparator = (row: string[]) => row.length > 0 && row.every((c) => /^:?-{3,}:?$/.test(c));

export function parseCredits(md: string | undefined | null): Credits {
  if (!md) return { sources: [] };
  const text = md.replace(/\r\n?/g, "\n");
  const notice = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /not affiliated/i.test(l) && !l.startsWith("|") && !l.startsWith("<!--"))
    .join(" ")
    .trim();
  const s = text.indexOf(START);
  const e = text.indexOf(END, s + START.length);
  if (s < 0 || e < 0) return { sources: [], notice: notice || undefined };
  const lines = text
    .slice(s + START.length, e)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));
  const rows = lines.map(cells);
  const header = rows[0]?.map((h) => h.toLowerCase());
  const body = rows.slice(1).filter((r) => !isSeparator(r));
  const col = (name: string, fallback: number) => {
    const i = header?.findIndex((h) => h === name) ?? -1;
    return i >= 0 ? i : fallback;
  };
  const iName = col("name", 0);
  const iUrl = col("url", 1);
  const iLic = header?.findIndex((h) => h === "licence" || h === "license") ?? -1;
  const iUsed = col("used for", 3);
  const iFiles = col("files", 4);
  const sources = body
    .map((r) => ({
      name: r[iName] ?? "",
      url: r[iUrl] ?? "",
      licence: r[iLic >= 0 ? iLic : 2] ?? "",
      usedFor: r[iUsed] ?? "",
      files: r[iFiles] ?? "",
    }))
    .filter((r) => r.name);
  return { sources, notice: notice || undefined };
}

/** Only http(s) URLs become links. */
export function safeUrl(u: string): string | undefined {
  return /^https?:\/\/[^\s]+$/i.test(u.trim()) ? u.trim() : undefined;
}

/** `CREDITS.md` from the repo root, bundled at build time. Missing file = empty credits. */
const files = import.meta.glob("../../../CREDITS.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
export const CREDITS: Credits = parseCredits(Object.values(files)[0]);
