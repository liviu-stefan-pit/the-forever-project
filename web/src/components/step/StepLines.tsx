import { useState } from "react";
import type { Profile } from "../../data/schema";
import { wayCommand, type QuestNameLookup } from "../../lib/actions";
import { copyText } from "../../lib/clipboard";
import { chipLive } from "../../lib/profileHints";
import type { CardModel, Goto, QuestAction } from "../../lib/stepLines";
import type { QuestLookup } from "../../state/questAvailability";
import { actionUnavailableTag } from "../../state/stepRequirement";
import { QuestLink } from "../quest/QuestLink";
import { Icon } from "../ui/Icon";
import { buildChips, Chip, FilterTag } from "./ActionChips";
import { RichLine, type LineHighlight } from "./RichLine";

interface LiveCtx {
  profile?: Profile | null;
  quests?: QuestLookup;
  stepId: string;
}

function countDone(count: string | undefined): boolean {
  if (!count) return false;
  const [have, need] = count.split("/").map(Number);
  return have !== undefined && need !== undefined && need > 0 && have >= need;
}

function Count({ count }: { count: string }) {
  return (
    <span data-testid="step-count" className={`ml-1 font-mono text-xs tabular-nums ${countDone(count) ? "text-done" : "text-muted"}`}>
      {count}
    </span>
  );
}

/** A quest name inside the step's own sentence: `!` accept, `?` turn in, objectives keep the text and gain a live count. */
function QuestMark({ text, action, ctx }: { text: string; action: QuestAction; ctx: LiveCtx }) {
  const live = chipLive(action, ctx.profile, ctx.quests);
  const unavailable = ctx.profile ? actionUnavailableTag(ctx.profile, action, ctx.quests) : undefined;
  const qid = action.questId;
  if (action.type === "accept" || action.type === "turnin") {
    const glyph = action.type === "accept" ? "!" : "?";
    const verb = action.type === "accept" ? "Accept" : "Turn in";
    return (
      <>
        <QuestLink
          id={action.questId}
          stepId={ctx.stepId}
          title={[`${verb} ${action.label}`, unavailable, live.warn].filter(Boolean).join(" · ")}
          className={`font-semibold text-bronze-300 decoration-bronze-400/50 underline-offset-2 hover:underline ${unavailable ? "line-through opacity-70" : ""}`}
        >
          <span data-testid={`mark-${action.type}`} aria-hidden="true" className="mr-0.5 inline-block w-[0.7em] text-center font-bold text-bronze-400">
            {glyph}
          </span>
          <span className="sr-only">{verb}: </span>
          {text}
        </QuestLink>
        {live.warn && <span className="ml-1 text-xs text-warn">({live.warn})</span>}
      </>
    );
  }
  const done = countDone(live.count);
  const name = <span className={`font-medium ${done ? "text-muted line-through" : "text-horde-300"}`}>{text}</span>;
  return (
    <>
      {qid !== undefined ? (
        <QuestLink id={qid} stepId={ctx.stepId} className="decoration-horde-300/50 underline-offset-2 hover:underline">
          {name}
        </QuestLink>
      ) : (
        name
      )}
      {live.count && <Count count={live.count} />}
    </>
  );
}

/** Objectives the sentence doesn't name ("take her head" → Head of Urs'anah): shown only with a synced count. */
function Trailing({ actions, ctx }: { actions: readonly QuestAction[]; ctx: LiveCtx }) {
  const items = actions
    .map((a) => ({ a, count: chipLive(a, ctx.profile, ctx.quests).count }))
    .filter((x): x is { a: QuestAction; count: string } => !!x.count);
  if (!items.length) return null;
  return (
    <span className="text-[13px] text-muted">
      {items.map(({ a, count }) => (
        <span key={`${a.type}-${a.questId}-${"objective" in a ? a.objective : ""}`}>
          {" · "}
          <span className={countDone(count) ? "line-through" : undefined}>{a.label}</span>
          <Count count={count} />
        </span>
      ))}
    </span>
  );
}

/** A waypoint as plain coordinates on its line: same height as the text, click to copy `/way`. */
function Way({ goto }: { goto: Goto }) {
  const [copied, setCopied] = useState(false);
  const way = wayCommand(goto.at);
  const label = `${goto.at.x.toFixed(1)}, ${goto.at.y.toFixed(1)}`;
  if (!way) return null;
  return (
    <button
      type="button"
      data-testid="step-way"
      onClick={async () => {
        if (await copyText(way)) {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        }
      }}
      title={`Copy "${way}" (TomTom)`}
      aria-label={`Copy waypoint ${way}`}
      className="inline-flex h-6 items-center gap-1 whitespace-nowrap font-mono text-xs tabular-nums text-muted transition hover:text-bronze-300"
    >
      <Icon name={copied ? "check" : "pin"} className={`h-3 w-3 ${copied ? "text-done" : "text-bronze-400"}`} />
      <span aria-live="polite">{copied ? "copied" : label}</span>
      {goto.filter && <FilterTag filter={goto.filter} />}
    </button>
  );
}

/**
 * The body of every step card: the author's lines, each with its waypoint pinned in the right column,
 * quest names highlighted where the text says them, and only the actions the text doesn't cover as chips.
 */
export function StepLines({
  model,
  questName,
  profile,
  quests,
  stepId,
  compact,
}: {
  model: CardModel;
  questName?: QuestNameLookup;
  profile?: Profile | null;
  quests?: QuestLookup;
  stepId: string;
  compact: boolean;
}) {
  const ctx: LiveCtx = { profile, quests, stepId };
  const extra = buildChips(model.extra, questName, profile, quests);
  const size = compact ? "text-[13px]" : "text-sm sm:text-[15px]";
  return (
    <div className="space-y-1.5" data-testid="step-lines">
      {model.lines.map((l, i) => {
        const marks: LineHighlight[] = l.marks.map((m) => ({ label: m.label, render: (text) => <QuestMark text={text} action={m.action} ctx={ctx} /> }));
        return (
          <div key={i} data-testid="step-line" className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4">
            <p className={`break-words ${size} leading-6 text-ink`}>
              {l.place && <strong className="font-semibold text-bronze-300">{l.place}: </strong>}
              <RichLine line={l.line} marks={marks} />
              {l.line.filter && (
                <span className="ml-1.5 align-middle">
                  <FilterTag filter={l.line.filter} />
                </span>
              )}
              <Trailing actions={l.trailing} ctx={ctx} />
            </p>
            {l.ways.length > 0 && (
              <div className="flex flex-col items-end">
                {l.ways.map((g, k) => (
                  <Way key={k} goto={g} />
                ))}
              </div>
            )}
          </div>
        );
      })}
      {extra.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {extra.map((c) => (
            <Chip key={c.key} spec={{ ...c, secondary: true }} stepId={stepId} />
          ))}
        </div>
      )}
    </div>
  );
}
