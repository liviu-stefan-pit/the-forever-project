import { Link } from "react-router";
import type { Profile, ProfessionKey } from "../data/schema";
import { continentLabel, reactionName, trainerTierLabel } from "../lib/characterReport";
import { formatMoney, linkKey, type CharacterLink } from "../state/gameSync";
import { GAME_FILE_REMINDER, useGameSyncUi } from "../state/gameSyncClient";
import { GAME_FILE_PATH_HINT } from "../state/gameFileHandle";
import { Icon } from "./ui/Icon";
import { Money, SkillBar } from "./ui/Money";

const SLOT_NAMES: Record<number, string> = {
  1: "Head", 2: "Neck", 3: "Shoulder", 4: "Shirt", 5: "Chest", 6: "Waist", 7: "Legs", 8: "Feet", 9: "Wrist",
  10: "Hands", 11: "Finger 1", 12: "Finger 2", 13: "Trinket 1", 14: "Trinket 2", 15: "Back", 16: "Main hand",
  17: "Off hand", 18: "Ranged", 19: "Tabard",
};

/** Select options for the character link: export characters plus the current link if it is not in the export. */
export function linkOptions(characters: readonly CharacterLink[], current?: CharacterLink): CharacterLink[] {
  const out = [...characters];
  if (current && !out.some((c) => linkKey(c) === linkKey(current))) out.push(current);
  return out;
}

export function linkLabel(l: CharacterLink): string {
  return l.realm ? `${l.name} — ${l.realm}` : l.name;
}

/** Status copy from a name-mismatch sync (see gameSyncClient status text). */
export function isNameMismatchStatus(statusText: string): boolean {
  return statusText.includes("Pick the character under Game sync");
}

const DT = "text-[11px] font-semibold uppercase tracking-wider text-muted sm:pt-0.5";

function XpBar({ cur, max }: { cur: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((cur / max) * 100)) : 0;
  return (
    <div className="mt-1 h-2 max-w-md overflow-hidden rounded-full bg-stroke/60" role="progressbar" aria-label="Experience" aria-valuenow={cur} aria-valuemin={0} aria-valuemax={max}>
      <div className="h-full rounded-full bg-gradient-to-r from-bronze-500/80 to-bronze-400" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Badge({ children, tone }: { children: string; tone: "done" | "danger" }) {
  const cls = tone === "done" ? "border-done/50 text-done" : "border-danger/50 text-danger";
  return <span className={`ml-1.5 inline-flex rounded border px-1.5 py-px text-[10px] font-bold uppercase tracking-wider ${cls}`}>{children}</span>;
}

/** Zone percent for display. Addon exports store 0–1; the guide uses 0–100. */
export function formatZoneCoord(n: number): string {
  return (Math.abs(n) <= 1 ? n * 100 : n).toFixed(1);
}

/** Plain readout of the game Sync link and the synced fields. Built from the saved profile. */
export function GameSyncPanel({ profile }: { profile: Profile }) {
  const sync = useGameSyncUi();
  const options = linkOptions(sync.characters, profile.character);
  const matched = sync.matched;
  const skills = Object.entries(profile.skills ?? {}) as [ProfessionKey, { cur: number; max: number }][];
  const gear = Object.entries(profile.gear ?? {})
    .map(([slot, id]) => [Number(slot), id] as const)
    .filter((e): e is readonly [number, number] => typeof e[1] === "number")
    .sort((a, b) => a[0] - b[0]);
  const gearName = (slot: number) => matched?.gear?.find((g) => g.slot === slot)?.name;
  const zone = [profile.position?.zone, profile.position?.subzone].filter(Boolean).join(" · ");
  const coords =
    profile.position?.x !== undefined && profile.position?.y !== undefined
      ? ` (${formatZoneCoord(profile.position.x)}, ${formatZoneCoord(profile.position.y)})`
      : "";
  const flights = [...(profile.flightPaths ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  const flightsByMap = new Map<string, typeof flights>();
  for (const fp of flights) {
    const label = continentLabel(fp.mapId);
    const list = flightsByMap.get(label) ?? [];
    list.push(fp);
    flightsByMap.set(label, list);
  }
  const bags = Object.entries(profile.bags ?? {})
    .map(([id, count]) => [Number(id), count] as const)
    .filter((e) => e[1] > 0)
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, 12);
  const repGroups = new Map<string, NonNullable<Profile["reputation"]>>();
  for (const row of profile.reputation ?? []) {
    const label = reactionName(row.reaction);
    const list = repGroups.get(label) ?? [];
    list.push(row);
    repGroups.set(label, list);
  }
  const warnings = profile.exportWarnings?.filter((w) => w.trim()) ?? [];

  return (
    <section className="wow-frame panel-animate p-5" aria-labelledby="game-sync-heading">
      <h2 id="game-sync-heading" className="flex items-center gap-2 font-display text-lg font-bold text-bronze-400">
        <Icon name="loop" className="h-4 w-4" />
        Game sync · {profile.name}
      </h2>
      {!sync.available ? (
        <>
        <p className="mt-1 hidden text-sm text-muted touch:block" data-testid="game-sync-phone">
          Game sync runs on the PC you play on (desktop Chrome or Edge). To follow the guide on your phone, sync there, press{" "}
          <strong className="text-ink">Export</strong> on the profile, and open that file here with{" "}
          <strong className="text-ink">Import JSON profile</strong>.
        </p>
        <p className="mt-1 text-sm text-muted touch:hidden" data-testid="game-sync-unavailable">
          One-click sync needs desktop Chrome or Edge. In this browser, use <strong className="text-ink">Import GuideWebExport.lua</strong>{" "}
          below; you can get the addon on the{" "}
          <Link to="/addons" className="text-bronze-400 hover:text-bronze-300">
            Addons
          </Link>{" "}
          page. {GAME_FILE_REMINDER.replace(" before you press Sync", " before you import it")}
        </p>
        </>
      ) : (
      <>
      <p className="mt-1 text-sm text-muted">{GAME_FILE_REMINDER}</p>

      {sync.mode === "file" && (
        <div className="mt-3 rounded-sm border border-stroke/70 bg-canvas/40 px-3 py-2 text-sm" data-testid="game-sync-file">
          <div className="flex flex-wrap items-center gap-2">
            <span className="min-w-0 flex-1 text-ink">
              {sync.fileName ? (
                <>
                  Reading <strong>{sync.fileName}</strong> from your PC. It stays on your PC; nothing is uploaded.
                </>
              ) : (
                "Choose GuideWebExport.lua once. This browser remembers it, so later Syncs need one click."
              )}
            </span>
            <button
              type="button"
              className="press inline-flex min-h-touch items-center rounded-sm border border-bronze-500/60 bg-frame px-3 text-sm font-semibold text-ink hover:border-bronze-400 hover:text-bronze-300"
              onClick={sync.chooseFile}
            >
              {sync.fileName ? "Change file" : "Choose file"}
            </button>
            {sync.fileName && (
              <button
                type="button"
                className="press inline-flex min-h-touch items-center rounded-sm border border-stroke px-3 text-sm text-muted hover:border-danger/60 hover:text-ink"
                onClick={sync.forgetFile}
              >
                Forget
              </button>
            )}
          </div>
          {!sync.fileName && <p className="mt-1 break-all text-xs text-muted">{GAME_FILE_PATH_HINT}</p>}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-3">
      <label className="block min-w-[14rem] flex-1 space-y-1 text-sm">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">In-game character</span>
        <select
          className="min-h-touch w-full rounded-sm border border-stroke bg-canvas/60 px-3 text-sm text-ink focus:border-bronze-500"
          value={profile.character ? linkKey(profile.character) : ""}
          onChange={(e) => {
            const pick = options.find((o) => linkKey(o) === e.target.value);
            sync.linkCharacter(pick ?? null);
          }}
        >
          <option value="">Match by profile name ({profile.name})</option>
          {options.map((o) => (
            <option key={linkKey(o)} value={linkKey(o)}>
              {linkLabel(o)}
            </option>
          ))}
        </select>
      </label>
        <button
          type="button"
          className="press inline-flex min-h-touch items-center gap-1.5 rounded-sm border border-bronze-500/60 bg-frame px-3 text-sm font-semibold text-ink hover:border-bronze-400 hover:text-bronze-300 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={sync.sync}
          disabled={sync.busy}
          aria-busy={sync.busy}
        >
          <Icon name="loop" className={`h-4 w-4 ${sync.busy ? "animate-spin motion-reduce:animate-none" : ""}`} />
          Sync now
        </button>
      </div>
      <p className="mt-2 text-sm text-muted" aria-live="polite">
        {sync.statusText || "Not synced yet"}
      </p>
      {isNameMismatchStatus(sync.statusText) && sync.characters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {sync.characters.map((character) => (
            <button
              key={linkKey(character)}
              type="button"
              className="press inline-flex min-h-touch items-center rounded-sm border border-bronze-500/60 bg-frame px-3 text-sm font-semibold text-ink hover:border-bronze-400 hover:text-bronze-300"
              onClick={() => sync.linkCharacter(character)}
            >
              Link to {linkLabel(character)}
            </button>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <p className="mt-3 rounded-sm border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-ink">
          Addon could not read: {warnings.join(", ")}
        </p>
      )}
      </>
      )}

      {profile.syncedAt !== undefined ? (
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-stroke/60 pt-4 text-sm text-ink sm:grid-cols-[8rem,1fr]">
          <dt className={DT}>Character</dt>
          <dd>
            {profile.character ? linkLabel(profile.character) : "?"}
            {profile.deadOrGhost ? <Badge tone="danger">Dead</Badge> : null}
          </dd>
          {(profile.level !== undefined || profile.xp !== undefined) && (
            <>
              <dt className={DT}>Level</dt>
              <dd>
                <span className="tabular-nums">{profile.level ?? "?"}</span>
                {profile.xp !== undefined && profile.xpMax !== undefined && (
                  <>
                    <span className="ml-1.5 tabular-nums text-muted">
                      {profile.xp} / {profile.xpMax} XP
                      {(profile.xpRested ?? 0) > 0 ? ` · +${profile.xpRested} rested` : ""}
                    </span>
                    <XpBar cur={profile.xp} max={profile.xpMax} />
                  </>
                )}
              </dd>
            </>
          )}
          {profile.money !== undefined && (
            <>
              <dt className={DT}>Gold</dt>
              <dd title={formatMoney(profile.money)}><Money copper={profile.money} /></dd>
            </>
          )}
          {(zone || profile.hearth) && (
            <>
              <dt className={DT}>Zone</dt>
              <dd>
                {zone ? `${zone}${coords}` : "—"}
                {profile.hearth ? <span className="mt-0.5 block text-muted">Hearth: {profile.hearth}</span> : null}
              </dd>
            </>
          )}
          <dt className={DT}>Quest log</dt>
          <dd>
            {!profile.questLogSyncedAt ? (
              "Quest log unknown"
            ) : profile.questLog?.length ? (
              <ul className="space-y-0.5">
                {profile.questLog.map((q) => (
                  <li key={q.questId}>
                    {q.title ?? `Quest ${q.questId}`}
                    {q.complete === 1 ? <Badge tone="done">Ready</Badge> : null}
                    {q.complete === -1 ? <Badge tone="danger">Failed</Badge> : null}
                    {q.objectives?.length ? (
                      <span className="text-muted">
                        {" "}
                        {q.objectives
                          .map((o) =>
                            o.numRequired !== undefined ? `${o.numFulfilled ?? 0}/${o.numRequired}` : o.finished ? "done" : o.text ?? "…",
                          )
                          .join(", ")}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              "Empty"
            )}
          </dd>
          {flights.length > 0 && (
            <>
              <dt className={DT}>Flight paths</dt>
              <dd>
                <p className="text-muted">{flights.length}</p>
                {[...flightsByMap.entries()].map(([label, list]) => (
                  <p key={label}>
                    <span className="font-semibold">{label}: </span>
                    {list.map((f) => f.name).join(", ")}
                  </p>
                ))}
              </dd>
            </>
          )}
          {skills.length > 0 && (
            <>
              <dt className={DT}>Professions</dt>
              <dd>
                <div className="grid max-w-md gap-2.5">
                  {skills.map(([name, s]) => (
                    <div key={name} className="space-y-0.5">
                      <SkillBar name={name} cur={s.cur} max={s.max} />
                      {trainerTierLabel(s.cur, s.max) && <p className="text-[11px] text-muted">{trainerTierLabel(s.cur, s.max)}</p>}
                    </div>
                  ))}
                </div>
              </dd>
            </>
          )}
          {profile.spells && (profile.spells.riding !== undefined || profile.spells.mount !== undefined) && (
            <>
              <dt className={DT}>Riding</dt>
              <dd>
                {profile.spells.riding !== undefined ? `Riding ${profile.spells.riding}` : "Riding unknown"}
                {profile.spells.mount !== undefined ? ` · mount ${profile.spells.mount ? "yes" : "no"}` : ""}
              </dd>
            </>
          )}
          {profile.weaponSkills && profile.weaponSkills.length > 0 && (
            <>
              <dt className={DT}>Weapons</dt>
              <dd>
                <ul className="space-y-0.5">
                  {profile.weaponSkills.map((w) => (
                    <li key={w.name} className="tabular-nums">
                      {w.name} {w.cur}/{w.max}
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          )}
          {repGroups.size > 0 && (
            <>
              <dt className={DT}>Reputation</dt>
              <dd className="space-y-1">
                {[...repGroups.entries()].map(([reaction, rows]) => (
                  <p key={reaction}>
                    <span className="font-semibold">{reaction}: </span>
                    {rows.map((r) => r.name).join(", ")}
                  </p>
                ))}
              </dd>
            </>
          )}
          {profile.durability?.pct !== undefined && (
            <>
              <dt className={DT}>Durability</dt>
              <dd className="tabular-nums">{profile.durability.pct}%</dd>
            </>
          )}
          {profile.pet && (profile.pet.name || profile.pet.family || profile.pet.level !== undefined) && (
            <>
              <dt className={DT}>Pet</dt>
              <dd>
                {[profile.pet.name, profile.pet.family, profile.pet.level !== undefined ? `level ${profile.pet.level}` : undefined]
                  .filter(Boolean)
                  .join(" · ")}
              </dd>
            </>
          )}
          {profile.bags !== undefined && (
            <>
              <dt className={DT}>Bags</dt>
              <dd>
                {bags.length ? (
                  <ul className="grid gap-x-4 sm:grid-cols-2">
                    {bags.map(([id, count]) => (
                      <li key={id} className="tabular-nums">
                        Item {id}: {count}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "Empty"
                )}
              </dd>
            </>
          )}
          {gear.length > 0 && (
            <>
              <dt className={DT}>Gear</dt>
              <dd>
                <ul className="grid gap-x-4 gap-y-0.5 sm:grid-cols-2">
                  {gear.map(([slot, id]) => (
                    <li key={slot} className="truncate">
                      {SLOT_NAMES[slot] ?? `Slot ${slot}`}: {gearName(slot) ?? "item"} ({id})
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          )}
          <dt className={DT}>Synced</dt>
          <dd>{new Date(profile.syncedAt).toLocaleString()}</dd>
        </dl>
      ) : (
        <p className="mt-3 rounded-sm border border-dashed border-stroke px-3 py-2 text-sm text-muted">No character data synced yet.</p>
      )}
    </section>
  );
}
