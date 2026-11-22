import type { Filter } from "../data/schema";

/**
 * Human-readable form of a `<< …` filter, e.g. `Warrior / Shaman`, `not Hunter`,
 * `Orc Warrior`, `not Warrior · not Shaman`. Evaluation lives in `state/visibility.ts` (P7).
 */
export function formatFilter(filter: Filter | undefined): string {
  if (!filter || filter.any.length === 0) return "";
  return filter.any
    .map((group) =>
      group
        .map((t) => {
          const name = [t.race, t.cls].filter(Boolean).join(" ");
          return t.not ? `not ${name}` : name;
        })
        .join(" · "),
    )
    .join(" / ");
}
