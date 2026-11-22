import type { Guide, GuideIndex, QuestInfo, RichText, ZoneInfo } from "../data/schema";
import type { SearchDoc } from "./types";

function stepPlain(lines: readonly RichText[]): string {
  return lines
    .map((line) =>
      line.segments
        .map((s) => s.t)
        .join("")
        .replace(/\|c[0-9A-Fa-f]{8}/g, "")
        .replace(/\|r/g, "")
        .replace(/\|T[^|]*\|t/g, ""),
    )
    .join(" ");
}

export const STEP_TEXT_CLIP = 160;

export interface NpcMin {
  id: number;
  name: string;
  spawns?: { zone?: string }[];
}

export interface SearchBuildInput {
  index: GuideIndex;
  guides: Guide[];
  quests: QuestInfo[];
  zones: ZoneInfo[];
  npcs?: NpcMin[];
  /** Quest id → step ids. Used when the catalog has no `inGuides`. */
  questSteps?: Record<string, readonly string[]>;
}

function clip(s: string, n = STEP_TEXT_CLIP): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n - 1)}…`;
}

function searchDoc(doc: SearchDoc): SearchDoc {
  if (doc.text === undefined || doc.text === doc.title) {
    const copy = { ...doc };
    delete copy.text;
    return copy;
  }
  return doc;
}

function firstGuideForZone(guides: Guide[], zoneName: string): string {
  const needle = zoneName.toLowerCase();
  return guides.find((g) => g.zones.some((z) => z.toLowerCase() === needle))?.slug ?? "";
}

export function buildSearchDocs(input: SearchBuildInput): SearchDoc[] {
  const { guides, quests, zones, npcs, questSteps } = input;
  const out: SearchDoc[] = [];

  for (const g of guides) {
    out.push(searchDoc({
      kind: "guide",
      id: g.slug,
      title: g.displayName,
      guide: g.slug,
      text: clip([g.zones.join(" · "), `${g.minLevel}–${g.maxLevel}`].filter(Boolean).join(" ")),
    }));
    for (const s of g.steps) {
      const text = clip(stepPlain(s.text) || `Step ${s.n}`);
      out.push(searchDoc({
        kind: "step",
        id: s.id,
        title: text,
        guide: g.slug,
        text,
      }));
    }
  }

  for (const q of quests) {
    const stepId = q.inGuides?.[0] ?? questSteps?.[String(q.id)]?.[0];
    out.push(searchDoc({
      kind: "quest",
      id: String(q.id),
      title: q.name,
      guide: stepId?.split(":")[0] ?? "",
      text: clip([q.zone, ...q.objectivesText].filter(Boolean).join(" ")),
    }));
  }

  for (const z of zones) {
    const levels = z.levels ? `Lv ${z.levels[0]}–${z.levels[1]}` : "";
    out.push(searchDoc({
      kind: "zone",
      id: String(z.mapId),
      title: z.name,
      guide: firstGuideForZone(guides, z.name),
      text: clip([levels, z.continent === 1 ? "Kalimdor" : "Eastern Kingdoms"].filter(Boolean).join(" ")),
    }));
  }

  for (const n of npcs ?? []) {
    const zoneNames = [...new Set((n.spawns ?? []).map((s) => s.zone).filter((z): z is string => Boolean(z)))];
    out.push(searchDoc({
      kind: "npc",
      id: String(n.id),
      title: n.name,
      guide: "",
      text: clip(zoneNames.join(" · ")),
    }));
  }

  return out;
}
