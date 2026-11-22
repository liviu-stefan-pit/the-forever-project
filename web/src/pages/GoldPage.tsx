/**
 * `#/gold` — the gold plan: big purchases on the way to 60, savings pace, where to earn in each
 * bracket (your bracket first), habits and farms to avoid. Data: `gold-plan.json`.
 */
import { GoldGoal } from "../components/dashboard/GoldGoal";
import { ExperimentalBadge } from "../components/ui/ExperimentalBadge";
import { Icon } from "../components/ui/Icon";
import { ErrorState, Skeleton } from "../components/ui/States";
import { useGoldPlan } from "../data/hooks";
import { bracketFor, fmtGold, isHonoredHome, milestoneDone, milestonePrice, sourcesFor, type GoldBracket, type GoldPlan } from "../lib/goldPlan";
import { useProfileApi } from "../state/profile";
import { useRoutePosition } from "../state/position";

function Sources({ plan, ids }: { plan: GoldPlan; ids: readonly string[] }) {
  const list = sourcesFor(plan, ids);
  if (!list.length) return null;
  return (
    <p className="mt-2 text-[11px] leading-relaxed text-muted">
      Sources:{" "}
      {list.map((s, i) => (
        <span key={s.id}>
          {i > 0 && " · "}
          <a href={s.url} target="_blank" rel="noreferrer noopener" className="underline decoration-stroke underline-offset-2 hover:text-ink">
            {s.label}
          </a>
        </span>
      ))}
    </p>
  );
}

function Bracket({ plan, b, current }: { plan: GoldPlan; b: GoldBracket; current: boolean }) {
  return (
    <details open={current} className={`wow-frame group p-0 ${current ? "ring-1 ring-bronze-500" : ""}`}>
      <summary className="flex min-h-touch cursor-pointer list-none items-center gap-3 px-4 py-3">
        <span className="font-display text-base font-bold text-bronze-400">
          Levels {b.levels[0]}–{b.levels[1]}
        </span>
        {current && <span className="rounded-sm bg-bronze-400 px-1.5 py-px text-[11px] font-bold text-canvas">You are here</span>}
        <span className="ml-auto text-xs tabular-nums text-muted">about {b.gph}g / hour</span>
        <Icon name="chevronDown" className="h-4 w-4 shrink-0 text-bronze-500 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-3 border-t border-bronze-900 px-4 pb-4 pt-3 text-sm">
        <p className="font-semibold text-ink">{b.focus}</p>
        {b.tips.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-ink/90">
            {b.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
        {b.spots.length > 0 && (
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-bronze-400">Where to earn</h3>
            <ul className="mt-1.5 divide-y divide-bronze-900">
              {b.spots.map((s) => (
                <li key={s.name} className="py-2">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-semibold text-ink">{s.name}</span>
                    <span className="text-xs tabular-nums text-muted">
                      {s.zone} · Lv {s.levels[0]}–{s.levels[1]}
                    </span>
                  </span>
                  <span className="block text-[13px] text-muted">{s.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Sources plan={plan} ids={b.sources} />
      </div>
    </details>
  );
}

export function GoldPage() {
  const res = useGoldPlan();
  const pos = useRoutePosition();
  const active = useProfileApi().active;
  const level = Math.max(1, Math.floor(active?.level ?? pos.level ?? 1));

  if (res.status === "error") {
    return (
      <div className="mx-auto max-w-3xl px-3 py-7 sm:px-6">
        <ErrorState title="Could not load the gold plan" error={res.error} retry={res.retry} />
      </div>
    );
  }
  if (res.status !== "ready") {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-3 py-7 sm:px-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  const plan = res.data;
  if (!plan) {
    return (
      <div className="mx-auto max-w-3xl px-3 py-7 text-sm text-muted sm:px-6">
        The gold plan is not in this build.
      </div>
    );
  }
  const honored = isHonoredHome(active);
  const current = bracketFor(plan, level);
  const profile = active ? { ...active, level: Math.max(active.level ?? 0, level) } : { level };

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-3 py-6 sm:px-6 sm:py-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-bronze-400">Horde · levels 1–60</p>
          <ExperimentalBadge />
        </div>
        <h1 className="font-display text-3xl font-bold text-bronze-400">Gold plan</h1>
        <p className="text-sm text-muted">
          What to save for, how much by when, and where to earn it while you level. {plan.note} Checked {plan.asOf}.
        </p>
      </header>

      <GoldGoal level={level} planLink={false} />

      <section className="wow-frame p-4 sm:p-5" aria-labelledby="gold-buys">
        <h2 id="gold-buys" className="font-display text-lg font-bold text-bronze-400">
          Big purchases
        </h2>
        <ul className="mt-2 divide-y divide-bronze-900">
          {plan.milestones.map((m) => {
            const done = milestoneDone(m, profile);
            const free = !!(active?.cls && m.freeFor?.includes(active.cls));
            return (
              <li key={m.id} className="py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    {done && <Icon name="check" className="h-4 w-4 text-done" aria-label="Done" />}
                    Level {m.level}: {m.label}
                  </span>
                  <span className="text-sm tabular-nums text-bronze-300">
                    {free ? "Free for your class" : fmtGold(milestonePrice(m, honored), m.budgetHigh)}
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] text-muted">{m.text}</p>
                <Sources plan={plan} ids={m.sources} />
              </li>
            );
          })}
        </ul>
        {plan.pace.length > 0 && (
          <div className="mt-2 rounded-sm border border-bronze-900 bg-canvas/40 p-3 text-[13px] text-ink/90">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-bronze-400">Savings pace</p>
            <ul className="mt-1 space-y-1">
              {plan.pace.map((p) => (
                <li key={p.level}>
                  <strong className="text-ink">Level {p.level}: {fmtGold(p.gold)}.</strong> {p.text}
                </li>
              ))}
            </ul>
            <Sources plan={plan} ids={plan.pace.flatMap((p) => p.sources)} />
          </div>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="gold-brackets">
        <h2 id="gold-brackets" className="font-display text-lg font-bold text-bronze-400">
          Where to earn, by level
        </h2>
        {plan.brackets.map((b) => (
          <Bracket key={b.levels.join("-")} plan={plan} b={b} current={b === current} />
        ))}
      </section>

      <section className="wow-frame p-4 sm:p-5" aria-labelledby="gold-habits">
        <h2 id="gold-habits" className="font-display text-lg font-bold text-bronze-400">
          Good habits
        </h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink/90">
          {plan.habits.map((h) => (
            <li key={h.text}>{h.text}</li>
          ))}
        </ul>
        <Sources plan={plan} ids={[...new Set(plan.habits.flatMap((h) => h.sources))]} />
      </section>

      <section className="wow-frame p-4 sm:p-5" aria-labelledby="gold-avoid">
        <h2 id="gold-avoid" className="flex items-center gap-2 font-display text-lg font-bold text-bronze-400">
          <Icon name="alert" className="h-5 w-5 text-rt-warn" /> Farms to skip
        </h2>
        <p className="mt-1 text-[13px] text-muted">Dead, hotfixed or risky. Some can get gold removed or an account suspended.</p>
        <ul className="mt-2 divide-y divide-bronze-900 text-sm">
          {plan.avoid.map((a) => (
            <li key={a.name} className="py-2">
              <span className="font-semibold text-ink">{a.name}</span>
              <span className="text-muted"> · {a.text}</span>
            </li>
          ))}
        </ul>
        <Sources plan={plan} ids={plan.avoidSources} />
      </section>
    </div>
  );
}
