import { useState } from "react";
import type { Action, Condition, Filter, Profile } from "../../data/schema";
import { actionChip, gotoSummary, type ChipSpec, type ChipTone, type QuestNameLookup } from "../../lib/actions";
import { chipLive } from "../../lib/profileHints";
import type { QuestLookup } from "../../state/questAvailability";
import { actionUnavailableTag } from "../../state/stepRequirement";
import { copyText } from "../../lib/clipboard";
import { formatFilter } from "../../lib/filter";
import { safeHref } from "../../lib/richtext";
import { QuestLink } from "../quest/QuestLink";
import { Icon } from "../ui/Icon";

export const TONE: Record<ChipTone, string> = {
  quest: "border-bronze-500/40 bg-bronze-900/40 text-bronze-300 hover:border-bronze-400/70",
  turnin: "border-horde-400/60 bg-horde-600/30 text-ink hover:border-horde-400",
  complete: "border-horde-500/40 bg-horde-700/40 text-bronze-300 hover:border-bronze-400/70",
  loot: "border-violet-400/35 bg-violet-950/40 text-violet-200 hover:border-violet-300/60",
  travel: "border-sky-400/35 bg-sky-950/40 text-sky-200 hover:border-sky-300/60",
  teal: "border-horde-500/40 bg-horde-700/40 text-bronze-300 hover:border-bronze-400/70",
  gold: "border-bronze-500/30 bg-frame text-bronze-300 hover:border-bronze-400/60",
  enemy: "border-rt-enemy/25 bg-transparent text-rt-enemy",
  friendly: "border-emerald-500/25 bg-transparent text-rt-friendly",
  muted: "border-stroke bg-transparent text-ink",
};

export function FilterTag({ filter }: { filter: Filter | undefined }) {
  const text = formatFilter(filter);
  if (!text) return null;
  return (
    <span className="inline-flex items-center rounded-sm border border-stroke bg-canvas/60 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-bronze-500/80" title={`Only: ${text}`}>
      {text}
    </span>
  );
}

function Chip({ spec, stepId }: { spec: ChipSpec; stepId?: string }) {
  const size = spec.secondary ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  const strike = spec.unavailable ? "line-through opacity-70" : "";
  const cls = `inline-flex max-w-full items-center gap-1.5 rounded-sm border ${size} transition ${strike} ${TONE[spec.tone]}`;
  const body = (
    <>
      <Icon name={spec.icon} className={spec.secondary ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"} strokeWidth={spec.icon === "exclaim" || spec.icon === "question" ? 3 : 2} />
      <span className="shrink-0 font-semibold">{spec.verb}</span>
      {spec.text && <span className="min-w-0 truncate opacity-90">{spec.text}</span>}
      {spec.unavailable && <span className="shrink-0 text-[10px] font-semibold uppercase no-underline">{spec.unavailable}</span>}
      {spec.count && <span className="shrink-0 tabular-nums opacity-80">{spec.count}</span>}
      {spec.badge && <span className="shrink-0 tabular-nums opacity-80">{spec.badge}</span>}
      {spec.warn && <span className="shrink-0 text-[10px] font-medium text-bronze-400/90">{spec.warn}</span>}
      {spec.filter && <FilterTag filter={spec.filter} />}
    </>
  );
  const questMatch = spec.to?.match(/^\/quest\/(\d+)$/);
  if (questMatch) {
    return (
      <QuestLink id={Number(questMatch[1])} stepId={stepId} className={`${cls} focus-visible:outline-bronze-400`} title={spec.title ?? spec.text}>
        {body}
      </QuestLink>
    );
  }
  const href = safeHref(spec.href);
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} title={href}>
        {body}
        <Icon name="external" className="h-3 w-3 shrink-0 opacity-70" />
      </a>
    );
  }
  return (
    <span className={cls} title={spec.title}>
      {body}
    </span>
  );
}

function WayChip({ way, label, filter }: { way: string; label: string; filter?: Filter }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(way)) {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        }
      }}
      className="group/way inline-flex min-h-touch touch:hidden items-center gap-1.5 rounded-sm border border-stroke bg-canvas/50 px-2 py-0.5 font-mono text-[11px] text-ink transition hover:border-horde-500/50 hover:text-bronze-300"
      title={`Copy "${way}" (TomTom)`}
      aria-label={`Copy waypoint ${way}`}
    >
      <Icon name="pin" className="h-3 w-3 text-bronze-400" />
      <span>{label}</span>
      {filter && <FilterTag filter={filter} />}
      <span className="ml-0.5 inline-flex items-center gap-1 text-[10px] font-sans text-bronze-500/80 group-hover/way:text-bronze-300" aria-live="polite">
        {copied ? (
          <>
            <Icon name="check" className="h-3 w-3" /> copied
          </>
        ) : (
          <>
            <Icon name="copy" className="h-3 w-3" /> /way
          </>
        )}
      </span>
    </button>
  );
}

/** Action chips: primary (quests, travel, training, xp), then secondary (targets, items) + waypoints. */
export function ActionChips({
  actions,
  questName,
  lineVisible,
  profile,
  quests,
  stepId,
}: {
  actions: readonly Action[];
  questName?: QuestNameLookup;
  lineVisible: (f: Filter | undefined) => boolean;
  profile?: Profile | null;
  quests?: QuestLookup;
  /** Owning step. Quest chips set `step` to this id. */
  stepId?: string;
}) {
  const shown = actions.filter((a) => lineVisible(a.filter));
  const chips = shown
    .map((a, i) => {
      const spec = actionChip(a, i, questName);
      if (!spec) return null;
      const live = chipLive(a, profile, quests);
      const unavailable = profile ? actionUnavailableTag(profile, a, quests) : undefined;
      const title = [spec.title, live.title, unavailable].filter(Boolean).join(" · ");
      return {
        ...spec,
        ...(unavailable ? { unavailable } : {}),
        ...(live.count ? { count: live.count } : {}),
        ...(live.warn ? { warn: live.warn } : {}),
        ...(title ? { title } : {}),
      };
    })
    .filter((c): c is ChipSpec => c !== null);
  const primary = chips.filter((c) => !c.secondary);
  const secondary = chips.filter((c) => c.secondary);
  const gotos = gotoSummary(shown);
  if (!chips.length && !gotos.points.length && !gotos.hiddenCount) return null;
  // One wrapping row: on phones the quest chip and its waypoint sit side by side instead of stacking.
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {primary.map((c) => (
        <Chip key={c.key} spec={c} stepId={stepId} />
      ))}
      {secondary.map((c) => (
        <Chip key={c.key} spec={c} stepId={stepId} />
      ))}
      {gotos.points.map((p) => (
        <WayChip key={p.key} way={p.way} label={`${p.at.x.toFixed(1)}, ${p.at.y.toFixed(1)}`} filter={p.filter} />
      ))}
      {gotos.hiddenCount > 0 && (
        <span className="inline-flex items-center gap-1 px-1 text-[11px] text-bronze-500/80 touch:hidden" title="Hidden path waypoints shape the route line on the map">
          <Icon name="map" className="h-3 w-3" />
          {gotos.hiddenCount} path point{gotos.hiddenCount === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}

export function ConditionBadges({ conditions, stepId }: { conditions: readonly Condition[]; stepId?: string }) {
  if (!conditions.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {conditions.map((c, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-sm border border-stroke/80 bg-canvas/40 px-1.5 py-0.5 text-[11px] text-bronze-500/80"
          title={`.${c.cmd} ${c.args}`}
        >
          <Icon name="info" className="h-3 w-3 opacity-70" />
          {c.questIds?.length ? (
            <QuestLink id={c.questIds[0]!} stepId={stepId} className="hover:text-ink hover:underline">
              {c.label}
            </QuestLink>
          ) : (
            c.label
          )}
        </span>
      ))}
    </div>
  );
}
