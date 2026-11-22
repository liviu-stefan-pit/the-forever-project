/** Copper shown as gold / silver / copper coins (presentation only; same split as `formatMoney`). */
export function Money({ copper, className = "" }: { copper: number; className?: string }) {
  const c = Math.max(0, Math.floor(copper));
  const g = Math.floor(c / 10000);
  const s = Math.floor((c % 10000) / 100);
  const k = c % 100;
  const coin = (n: number, unit: string, color: string) => (
    <span className="inline-flex items-center gap-0.5 tabular-nums">
      {n}
      <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color, boxShadow: "inset 0 -1px 0 rgba(0,0,0,.35)" }} />
      <span className="sr-only">{unit}</span>
    </span>
  );
  return (
    <span className={`inline-flex items-center gap-2 font-semibold ${className}`} aria-label={`${g} gold ${s} silver ${k} copper`}>
      {g > 0 && coin(g, "gold", "#ffd100")}
      {(g > 0 || s > 0) && coin(s, "silver", "#c7ccd4")}
      {coin(k, "copper", "#c0763a")}
    </span>
  );
}

/** Skill cur/max bar (e.g. Mining 112/150). */
export function SkillBar({ name, cur, max }: { name: string; cur: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((cur / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold text-ink">{name}</span>
        <span className="tabular-nums text-muted">
          {cur}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stroke/60" role="progressbar" aria-label={`${name} skill`} aria-valuenow={cur} aria-valuemin={0} aria-valuemax={max}>
        <div className="h-full rounded-full bg-gradient-to-r from-profession/70 to-profession transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
