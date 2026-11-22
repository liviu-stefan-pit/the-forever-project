export type SearchKind = "guide" | "step" | "quest" | "npc" | "zone";

export interface SearchDoc {
  kind: SearchKind;
  id: string;
  title: string;
  /** Guide slug when the hit belongs to one; empty otherwise. */
  guide: string;
  /** Omitted when it is the same string as `title`. */
  text?: string;
}
