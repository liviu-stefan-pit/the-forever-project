import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import type { ClassKey, RaceKey, Role } from "../data/schema";
import { Link } from "react-router";
import { GameSyncPanel } from "../components/GameSyncPanel";
import { Icon } from "../components/ui/Icon";
import { EmptyState, ErrorState } from "../components/ui/States";
import { parseGuideWebExport, type GameExportCharacter } from "../state/luaExport";
import { exportProfile } from "../state/profileStore";
import { useProfileApi } from "../state/profile";
import { CLASS_KEYS, PRIMARY_PROFESSIONS, ROLES, SECONDARY_PROFESSIONS } from "../../../contracts/schema";
import { ROLE_LABEL } from "../lib/profileExtras";
import { readXpMods } from "../lib/xp/recomputeSim";

const RACES: RaceKey[] = ["Orc", "Troll", "Tauren", "Undead", "Skyborne"];
/** WoW Forever adds the Horde Paladin. */
const CLASSES: readonly ClassKey[] = CLASS_KEYS;

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-7 sm:px-6">
      <header className="panel-animate space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-bronze-400">Characters</p>
        <h1 className="font-display text-3xl font-bold text-bronze-400">Profiles</h1>
      </header>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-bronze-500/80">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "min-h-touch w-full rounded-sm border border-stroke bg-canvas/60 px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-bronze-500";

/** One-line label for a character in a GuideWebExport.lua preview. */
export function luaCharacterLabel(ch: GameExportCharacter): string {
  const name = ch.name ?? ch.key;
  const raceCls = ch.race || ch.cls ? ` · ${ch.race ?? "?"} ${ch.cls ?? "?"}` : "";
  const lv = ch.level != null ? ` · lv ${ch.level}` : "";
  const quests = ch.completedQuests.length ? ` · ${ch.completedQuests.length} completed quests` : "";
  return `${name}${raceCls}${lv}${quests}`;
}

function downloadJson(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ProfilePage() {
  const api = useProfileApi();
  const [name, setName] = useState("");
  const [race, setRace] = useState<RaceKey>("Orc");
  const [cls, setCls] = useState<ClassKey>("Warrior");
  const [level, setLevel] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [luaChars, setLuaChars] = useState<GameExportCharacter[] | null>(null);
  const [luaPick, setLuaPick] = useState(0);
  const [luaMark, setLuaMark] = useState(true);
  const jsonInput = useRef<HTMLInputElement>(null);
  const luaInput = useRef<HTMLInputElement>(null);
  const active = api.active;

  const onCreate = () => {
    if (!name.trim() || !race || !cls) {
      setFormError("Name, race and class are required.");
      return;
    }
    const lv = level.trim() ? Number(level) : undefined;
    if (level.trim() && !Number.isFinite(lv)) {
      setFormError("Level must be a number.");
      return;
    }
    api.create({ name: name.trim(), race, cls, level: lv });
    setName("");
    setLevel("");
    setFormError(null);
  };

  const onJsonFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    file.text().then((text) => {
      try {
        api.importParsed(text);
        setFormError(null);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Could not import that JSON file.");
      }
    });
  };

  const onLuaFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    file.text().then((text) => {
      try {
        const parsed = parseGuideWebExport(text);
        if (parsed.characters.length === 0) {
          setLuaChars(null);
          setFormError("No character table found in GuideWebExport.lua.");
          return;
        }
        setLuaChars(parsed.characters);
        setLuaPick(0);
        setFormError(null);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Could not parse GuideWebExport.lua.");
      }
    });
  };

  return (
    <PageFrame>
      {api.loadError && <ErrorState title="Could not load saved profiles" error={new Error(api.loadError)} />}
      {formError && <ErrorState title="Profile error" error={new Error(formError)} />}

      <section className="wow-frame p-5">
        <h2 className="font-display text-lg font-bold text-bronze-400">New character</h2>
        <p className="mt-1 text-sm text-bronze-300/70">Race picks the starting zone. Class and race filter the route.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Name">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Thrall" />
          </Field>
          <Field label="Level (optional)">
            <input className={inputCls} inputMode="numeric" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="1" />
          </Field>
          <Field label="Race">
            <select className={inputCls} value={race} onChange={(e) => setRace(e.target.value)}>
              {RACES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Class">
            <select className={inputCls} value={cls} onChange={(e) => setCls(e.target.value as ClassKey)}>
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 inline-flex items-center gap-2 rounded-sm border border-bronze-500 bg-horde-500 px-4 py-2 text-sm font-semibold text-ink shadow-lg shadow-horde-700/40 transition hover:bg-bronze-400"
        >
          <Icon name="user" className="h-4 w-4" />
          Create profile
        </button>
      </section>

      {api.profiles.length === 0 ? (
        <EmptyState icon="user" title="No profiles yet">
          Create a character to keep ticks, filters and your reading cursor across reloads.
        </EmptyState>
      ) : (
        <section className="space-y-3">
          {api.profiles.map((p) => {
            const on = p.id === active?.id;
            return (
              <article
                key={p.id}
                className={`wow-frame p-4 ${on ? "border-horde-500/40 bg-horde-700/20" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button type="button" onClick={() => api.switchTo(p.id)} className="min-w-0 text-left">
                    <h3 className="font-display text-lg font-bold text-bronze-400">{p.name}</h3>
                    <p className="text-sm text-bronze-300/70">
                      {p.race} {p.cls}
                      {p.level != null ? ` · lv ${p.level}` : ""}
                      {on ? " · active" : ""}
                    </p>
                  </button>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => api.switchTo(p.id)}
                      className="rounded-sm border border-bronze-500/60 bg-frame px-2.5 py-1 text-xs font-semibold text-ink hover:border-bronze-400"
                    >
                      {on ? "Active" : "Switch"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenaming({ id: p.id, name: p.name })}
                      className="rounded-sm border border-bronze-500/60 bg-frame px-2.5 py-1 text-xs text-ink hover:border-bronze-400"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => api.duplicate(p.id)}
                      className="rounded-sm border border-bronze-500/60 bg-frame px-2.5 py-1 text-xs text-ink hover:border-bronze-400"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadJson(`${p.name.replace(/\s+/g, "-")}.json`, exportProfile(p))}
                      className="rounded-sm border border-bronze-500/60 bg-frame px-2.5 py-1 text-xs text-ink hover:border-bronze-400"
                    >
                      Export
                    </button>
                    <button
                      type="button"
                      onClick={() => api.remove(p.id)}
                      className="rounded-sm border border-stroke px-2.5 py-1 text-xs text-rt-enemy hover:border-rt-enemy"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {renaming?.id === p.id && (
                  <form
                    className="mt-3 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      api.rename(p.id, renaming.name);
                      setRenaming(null);
                    }}
                  >
                    <input className={inputCls} value={renaming.name} onChange={(e) => setRenaming({ id: p.id, name: e.target.value })} autoFocus />
                    <button type="submit" className="rounded-sm border border-bronze-500 bg-horde-500 px-3 text-sm font-semibold text-ink">
                      Save
                    </button>
                  </form>
                )}
              </article>
            );
          })}
        </section>
      )}

      {active && (
        <section className="wow-frame p-5">
          <h2 className="font-display text-lg font-bold text-bronze-400">Options · {active.name}</h2>
          <div className="mt-3 space-y-2 text-sm text-ink">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={active.options.showOptional}
                onChange={(e) => api.setOptions({ showOptional: e.target.checked })}
              />
              Show #optional steps
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={active.options.hideDone} onChange={(e) => api.setOptions({ hideDone: e.target.checked })} />
              Hide completed steps
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={active.options.dungeons === true} onChange={(e) => api.setOptions({ dungeons: e.target.checked })} />
              Include dungeons (off = fully solo route)
            </label>
          </div>
          <fieldset className="mt-4 space-y-3">
            <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted">XP bonuses you have</legend>
            {(() => {
              const mods = readXpMods(active.options.xpMods);
              const save = (patch: Partial<typeof mods>) => api.setOptions({ xpMods: { ...mods, ...patch } });
              return (
                <>
                  <label className="flex items-center gap-2 text-sm text-ink" title="+5% experience from kills while the food buff is up. Most cooked meals. Turn this on only if you will keep food active.">
                    <input type="checkbox" checked={mods.wellFed} onChange={(e) => save({ wellFed: e.target.checked })} />
                    Well Fed food
                  </label>
                  <p className="text-xs text-muted">+5% experience from kills while the food buff is up. Most cooked meals. Turn this on only if you will keep food active.</p>
                  <label className="block space-y-1 text-sm text-ink">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Rested experience</span>
                    <select
                      className={inputCls}
                      value={mods.restedPolicy}
                      title="Rested experience doubles kill experience until it runs out. 'From the game' uses the rested pool synced from the addon. 'One inn rest' assumes you logged out at an inn and banked about 5% of a level."
                      onChange={(e) => save({ restedPolicy: e.target.value as typeof mods.restedPolicy })}
                    >
                      <option value="none">None</option>
                      <option value="fromGame">Use rested xp from the game</option>
                      <option value="perSession">Assume one inn rest</option>
                    </select>
                  </label>
                  <p className="text-xs text-muted">Rested experience doubles kill experience until it runs out. From the game uses the rested pool synced from the addon. One inn rest assumes you logged out at an inn and banked about 5% of a level.</p>
                  <label className="block space-y-1 text-sm text-ink">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Well Rested rank</span>
                    <select
                      className={inputCls}
                      value={mods.legacyWellRestedRank}
                      title="Legacy perk. +4% rested rate and cap per rank. Leave at 0 unless this account has already earned Legacy points. A first character does not have it."
                      onChange={(e) => save({ legacyWellRestedRank: Number(e.target.value) })}
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="text-xs text-muted">Legacy perk. +4% rested rate and cap per rank. Leave at 0 unless this account has already earned Legacy points. A first character does not have it.</p>
                  <label className="flex items-center gap-2 text-sm text-ink" title="+3% to all experience after level 14. The chain takes well over an hour, so most routes skip it until after 20. Turn on only if you already have the bag.">
                    <input type="checkbox" checked={mods.sleepingBag} onChange={(e) => save({ sleepingBag: e.target.checked })} />
                    Cozy Sleeping Bag
                  </label>
                  <p className="text-xs text-muted">+3% to all experience after level 14. The chain takes well over an hour, so most routes skip it until after 20. Turn on only if you already have the bag.</p>
                </>
              );
            })()}
          </fieldset>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Class</span>
              <select className={inputCls} value={active.cls} onChange={(e) => api.setCharacter({ cls: e.target.value as ClassKey })}>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Role</span>
              <select className={inputCls} value={active.role ?? ""} onChange={(e) => api.setCharacter({ role: (e.target.value || null) as Role | null })}>
                <option value="">Any role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <fieldset className="mt-4">
            <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted">Professions (two primary, any secondary)</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[...PRIMARY_PROFESSIONS, ...SECONDARY_PROFESSIONS].map((prof) => {
                const list = active.professions ?? [];
                const on = list.includes(prof);
                const primary = (PRIMARY_PROFESSIONS as readonly string[]).includes(prof);
                const primaryCount = list.filter((x) => (PRIMARY_PROFESSIONS as readonly string[]).includes(x)).length;
                const blocked = !on && primary && primaryCount >= 2;
                return (
                  <button
                    key={prof}
                    type="button"
                    aria-pressed={on}
                    disabled={blocked}
                    title={blocked ? "Two primary professions already picked" : undefined}
                    onClick={() => api.setCharacter({ professions: on ? list.filter((x) => x !== prof) : [...list, prof] })}
                    className={`press min-h-touch rounded-sm border px-2.5 text-sm ${
                      on ? "border-profession/70 bg-profession/15 text-ink" : "border-stroke text-muted hover:text-ink"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {prof}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-muted">With none picked, every profession hint shows.</p>
          </fieldset>
          <p className="mt-4 text-xs text-muted">
            Data sources and licences: <Link to="/credits" className="text-bronze-400 hover:text-bronze-300">Credits</Link> · Privacy and
            licence: <Link to="/about" className="text-bronze-400 hover:text-bronze-300">About</Link>
          </p>
        </section>
      )}

      {active && <GameSyncPanel profile={active} />}

      <section className="wow-frame p-5">
        <h2 className="font-display text-lg font-bold text-bronze-400">Import</h2>
        <p className="mt-1 text-sm text-bronze-300/70">JSON profile, or a GuideWebExport.lua SavedVariables dump from the game.</p>
        <p className="mt-1 text-sm text-muted">
          No GuideWebExport yet?{" "}
          <Link to="/addons" className="text-bronze-400 hover:text-bronze-300">
            Download the addon
          </Link>
          , type /gwe then /reload in game, and pick WTF\Account\&lt;account&gt;\SavedVariables\GuideWebExport.lua here. The file is read in
          your browser only.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => jsonInput.current?.click()}
            className="rounded-sm border border-bronze-500/60 bg-frame px-3 py-2 text-sm text-ink hover:border-bronze-400"
          >
            Import JSON profile
          </button>
          <button
            type="button"
            onClick={() => luaInput.current?.click()}
            className="rounded-sm border border-bronze-500/60 bg-frame px-3 py-2 text-sm text-ink hover:border-bronze-400"
          >
            Import GuideWebExport.lua
          </button>
          <input ref={jsonInput} type="file" accept="application/json,.json" className="hidden" onChange={onJsonFile} />
          <input ref={luaInput} type="file" accept=".lua,text/plain" className="hidden" onChange={onLuaFile} />
        </div>
        {luaChars && luaChars.length > 0 && (
          <div className="mt-4 space-y-3 rounded-sm border border-horde-500/30 bg-canvas/40 p-4 text-sm">
            <fieldset className="space-y-2">
              <legend className="text-ink">
                {luaChars.length === 1 ? "Found 1 character" : `Found ${luaChars.length} characters — pick one`}
              </legend>
              {luaChars.map((ch, i) => (
                <label key={`${ch.key}:${i}`} className="flex items-start gap-2 text-ink">
                  <input
                    type="radio"
                    name="lua-character"
                    className="mt-1"
                    checked={luaPick === i}
                    onChange={() => setLuaPick(i)}
                  />
                  <span>
                    <strong className="text-bronze-300">{ch.name ?? ch.key}</strong>
                    {luaCharacterLabel(ch).slice((ch.name ?? ch.key).length)}
                  </span>
                </label>
              ))}
            </fieldset>
            <label className="flex items-center gap-2 text-ink">
              <input type="checkbox" checked={luaMark} onChange={(e) => setLuaMark(e.target.checked)} />
              Mark completed quests as done (propagates to matching steps)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const luaPreview = luaChars[luaPick] ?? luaChars[0];
                  if (!luaPreview) return;
                  if (luaPreview.race && luaPreview.cls) {
                    api.importGameCharacter(luaPreview, luaMark);
                    setLuaChars(null);
                    return;
                  }
                  setName(luaPreview.name ?? luaPreview.key);
                  if (luaPreview.race) setRace(luaPreview.race);
                  if (luaPreview.cls) setCls(luaPreview.cls);
                  if (luaPreview.level != null) setLevel(String(luaPreview.level));
                  setFormError("Race and class are required — they were missing from the export, so the form was prefilled.");
                  setLuaChars(null);
                }}
                className="rounded-sm border border-bronze-500 bg-horde-500 px-3 py-1.5 text-sm font-semibold text-ink hover:bg-bronze-400"
              >
                Create profile from game
              </button>
              <button type="button" onClick={() => setLuaChars(null)} className="rounded-sm border border-bronze-500/60 bg-frame px-3 py-1.5 text-sm text-ink">
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </PageFrame>
  );
}
