import { useState } from "react";
import { CLASS_KEYS } from "../../../../contracts/schema";
import type { ClassKey, RaceKey } from "../../data/schema";
import { useProfileApi } from "../../state/profile";
import { Icon } from "../ui/Icon";

const RACES: { race: RaceKey; start: string }[] = [
  { race: "Orc", start: "Durotar" },
  { race: "Troll", start: "Durotar" },
  { race: "Tauren", start: "Mulgore" },
  { race: "Undead", start: "Tirisfal" },
  { race: "Skyborne", start: "Zephras Isle" },
];

const chip = (on: boolean) =>
  `press inline-flex min-h-touch items-center justify-center rounded-sm border px-3 text-sm font-semibold transition ${
    on ? "border-bronze-400 bg-horde-700/50 text-bronze-200" : "border-stroke text-ink hover:border-bronze-500"
  }`;

/**
 * First visit: race and class in two taps, so the start zone, class quests, tips and hidden steps
 * are right before the first step. Creates a profile (the name can be changed on the Profile page).
 */
export function QuickStart() {
  const api = useProfileApi();
  const [race, setRace] = useState<RaceKey | null>(null);
  const [cls, setCls] = useState<ClassKey | null>(null);
  const [name, setName] = useState("");

  const create = () => {
    if (!race || !cls) return;
    api.create({ name: name.trim() || `${race} ${cls}`, race, cls });
  };

  return (
    <section className="space-y-3 rounded-sm border border-bronze-500/60 bg-bronze-900/20 p-4" aria-labelledby="quick-start">
      <h2 id="quick-start" className="flex items-center gap-2 text-sm font-bold text-ink">
        <Icon name="user" className="h-4 w-4 text-bronze-400" /> Who are you leveling?
      </h2>
      <p className="text-[13px] text-muted">Race picks your start zone. Class adds your class quests and tips and hides steps that are not for you.</p>
      <div role="group" aria-label="Race" className="flex flex-wrap gap-1.5">
        {RACES.map((r) => (
          <button key={r.race} type="button" aria-pressed={race === r.race} onClick={() => setRace(r.race)} className={chip(race === r.race)} title={`Starts in ${r.start}`}>
            {r.race}
          </button>
        ))}
      </div>
      <div role="group" aria-label="Class" className="flex flex-wrap gap-1.5">
        {CLASS_KEYS.map((c) => (
          <button key={c} type="button" aria-pressed={cls === c} onClick={() => setCls(c)} className={chip(cls === c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted">
          Character name (optional)
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={race && cls ? `${race} ${cls}` : "Thrall"}
            className="min-h-touch rounded-sm border border-stroke bg-canvas px-2 text-base text-ink focus:border-bronze-500 focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={create}
          disabled={!race || !cls}
          className="press inline-flex min-h-touch items-center gap-2 rounded-sm border border-bronze-500 bg-horde-500 px-4 font-semibold text-ink hover:bg-horde-400 disabled:opacity-50"
        >
          Save character
        </button>
      </div>
    </section>
  );
}
