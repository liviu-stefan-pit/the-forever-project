/**
 * Right-panel sections under the map (DESIGN.md §2): tips for the selected step, then
 * professions (recommended pair for the class, synced skills, this step's hint).
 * Data-driven: `class_professions.json` + `step.tips` / `professionHooks` + synced `Profile.skills`.
 */
import { Link } from "react-router";
import type { ClassKey, ClassProfessions, Profile, ProfessionKey, Step } from "../../data/schema";
import { dataOf, useClassProfessions } from "../../data/hooks";
import { cardTips, hookReached, hookSkillWarning, hookText, type TipContext } from "../../lib/stepExtras";
import { ROLE_LABEL } from "../../lib/profileExtras";
import { milestoneLabel, nextProfessionMilestone, trainerTierLabel } from "../../lib/characterReport";
import { Icon } from "../ui/Icon";
import { SkillBar } from "../ui/Money";

export function StepTipsPanel({ step, ctx }: { step: Step | undefined; ctx: TipContext }) {
  if (!step) return null;
  const { tip, elite } = cardTips(step, ctx);
  if (!tip && !elite.length) return null;
  return (
    <section aria-label="Tips for this step" className="wow-frame panel-animate space-y-2 p-4">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold tracking-wide text-bronze-400">
        <Icon name="info" className="h-4 w-4 text-tip" /> Tips
        {ctx.cls && <span className="font-sans text-xs font-normal text-muted">· {ctx.cls}{ctx.role ? ` ${ROLE_LABEL[ctx.role]}` : ""}</span>}
      </h2>
      {tip && <p className="text-sm leading-snug text-ink">{tip.text}</p>}
      {elite.map((e, i) => (
        <p key={i} className="flex items-start gap-2 text-sm leading-snug text-ink">
          <span className="mt-px inline-flex shrink-0 items-center gap-1 rounded border border-danger/50 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-danger">
            <Icon name="skull" className="h-3 w-3" /> Elite
          </span>
          <span>
            {e.name && <strong className="font-semibold">{e.name}: </strong>}
            {e.tip?.text}
          </span>
        </p>
      ))}
    </section>
  );
}

/** Best recommended pair for the class (role-matched first). */
export function bestPair(rec: ClassProfessions | undefined, role?: string) {
  if (!rec?.primary.length) return undefined;
  const sorted = [...rec.primary].sort((a, b) => a.rank - b.rank);
  return sorted.find((p) => !p.roles?.length || (role && p.roles.includes(role as never))) ?? sorted[0];
}

export function ProfessionPanel({ profile, step, ctx }: { profile: Profile | null; step: Step | undefined; ctx: TipContext }) {
  const file = dataOf(useClassProfessions());
  const cls: ClassKey | undefined = profile?.cls;
  const rec = cls ? file?.[cls] : undefined;
  const pair = bestPair(rec, profile?.role);
  const skills = Object.entries(profile?.skills ?? {}) as [ProfessionKey, { cur: number; max: number }][];
  const hooks = step ? cardTips(step, ctx).hooks : [];

  return (
    <section aria-label="Professions" className="wow-frame panel-animate space-y-3 p-4">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold tracking-wide text-bronze-400">
        <Icon name="bag" className="h-4 w-4 text-profession" /> Professions
      </h2>
      {pair ? (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-ink">
            {pair.pair[0]} + {pair.pair[1]}
            <span className="ml-1.5 text-xs font-normal text-muted">recommended for {cls}</span>
          </p>
          <p className="text-xs leading-snug text-muted">{pair.reason}</p>
          {rec && !rec.verified && (
            <span title="From WoW Forever data, not yet checked in game." className="inline-flex items-center gap-1 rounded border border-stroke px-1.5 py-px text-[10px] font-medium text-muted">
              <Icon name="question" className="h-3 w-3" /> Recommendation unverified
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted">{cls ? `No recommendation for ${cls} yet.` : "Pick a class to see the recommended pair."}</p>
      )}
      {skills.length > 0 && (
        <div className="space-y-2 border-t border-stroke/60 pt-3">
          <p className="text-[11px] leading-snug text-muted">Synced from game</p>
          {skills.map(([name, s]) => {
            const milestone = nextProfessionMilestone(rec?.levelingPlan, name, s.cur);
            const note = milestone ? milestoneLabel(milestone) : trainerTierLabel(s.cur, s.max);
            return (
              <div key={name} className="space-y-0.5">
                <SkillBar name={name} cur={s.cur} max={s.max} />
                {note && <p className="text-[11px] leading-snug text-muted">{note}</p>}
              </div>
            );
          })}
        </div>
      )}
      {hooks.length > 0 && !(ctx.professions?.length || skills.length) && (
        <p className="border-t border-stroke/60 pt-3 text-[11px] leading-snug text-muted" data-testid="profession-pick-hint">
          Pick your professions on the{" "}
          <Link to="/profile" className="text-bronze-400 hover:text-bronze-300">
            Profile
          </Link>{" "}
          page to see these notes on the steps too.
        </p>
      )}
      {hooks.length > 0 && (
        <ul className="space-y-1.5 border-t border-stroke/60 pt-3">
          {hooks.map((h, i) => {
            const reached = hookReached(h, ctx.skills);
            const warn = hookSkillWarning(h, ctx.skills);
            return (
            <li key={i} className={`flex items-start gap-2 text-xs ${reached ? "text-muted opacity-70" : "text-ink"}`}>
              <span className={`shrink-0 font-semibold text-profession ${reached ? "line-through" : ""}`}>{h.profession}</span>
              <span>
                <span className={reached ? "line-through" : undefined}>{hookText(h, ctx.skills)}</span>
                {warn && <span className="text-bronze-400"> · {warn}</span>}
                {h.npc && <span className="text-muted"> · {h.npc.name}, {h.npc.x.toFixed(1)}, {h.npc.y.toFixed(1)} {h.npc.zone}</span>}
              </span>
            </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
