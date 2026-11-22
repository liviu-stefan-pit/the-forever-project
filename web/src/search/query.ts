import MiniSearch from "minisearch";
import type { SearchDoc } from "./types";

type IndexedDoc = SearchDoc & { key: string };

/** Index rows may omit `text` when it equals `title`. */
export type SearchInput = Omit<SearchDoc, "text"> & { text?: string };

function withText(d: SearchInput): IndexedDoc {
  return {
    kind: d.kind,
    id: d.id,
    title: d.title,
    guide: d.guide,
    text: typeof d.text === "string" ? d.text : d.title,
    key: `${d.kind}:${d.id}`,
  };
}

const BOOST = { title: 4, id: 2 } as const;

export function createSearchEngine(docs: readonly SearchInput[]): MiniSearch<IndexedDoc> {
  const mini = new MiniSearch<IndexedDoc>({
    idField: "key",
    fields: ["title", "text", "id"],
    storeFields: ["kind", "id", "title", "guide", "text"],
    searchOptions: { boost: BOOST, prefix: true, fuzzy: false },
  });
  mini.addAll(docs.map(withText));
  return mini;
}

export function searchDocs(engine: MiniSearch<IndexedDoc>, query: string): SearchDoc[] {
  const q = query.trim();
  if (!q) return [];
  return engine
    .search(q, {
      boost: BOOST,
      prefix: true,
      fuzzy: q.length >= 4 ? 0.2 : false,
    })
    .map((hit) => ({
      kind: hit.kind,
      id: hit.id,
      title: hit.title,
      guide: hit.guide,
      text: typeof hit.text === "string" ? hit.text : hit.title,
    }));
}

export function searchResultPath(doc: SearchDoc): string {
  switch (doc.kind) {
    case "guide":
      return `/guide/${doc.id}`;
    case "step":
      return `/guide/${doc.guide}?step=${encodeURIComponent(doc.id)}`;
    case "quest":
      return `/quest/${doc.id}`;
    case "zone":
      return doc.guide ? `/guide/${doc.guide}` : `/overview?zone=${encodeURIComponent(doc.title)}`;
    case "npc":
      return doc.guide ? `/guide/${doc.guide}` : "/overview";
  }
}
