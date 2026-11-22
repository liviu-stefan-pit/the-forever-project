import type { Profile } from "../../data/schema";
import { dataOf, useTrainerTiers } from "../../data/hooks";
import { ridingNudge, trainerNudges } from "../../lib/profileHints";

/** Trainer and riding reminders. Quiet when nothing applies. */
export function CharacterNudges({ profile }: { profile: Profile | null }) {
  const rows = dataOf(useTrainerTiers()) ?? [];
  if (!profile) return null;
  const lines = [...trainerNudges(profile, rows)];
  const riding = ridingNudge(profile);
  if (riding) lines.push(riding);
  if (!lines.length) return null;
  return (
    <section aria-label="Training reminders" className="wow-frame panel-animate space-y-1 p-4" data-testid="character-nudges">
      {lines.map((line) => (
        <p key={line} className="text-xs font-semibold text-bronze-300">
          {line}
        </p>
      ))}
    </section>
  );
}
