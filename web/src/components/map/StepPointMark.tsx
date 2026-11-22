/** One progress mark on the zone map (DESIGN.md §4): current ring, done check, or a plain dot. */
import type { StepPoint } from "../../lib/stepPoints";

const label = (p: StepPoint) => `Step${p.ns.length > 1 ? "s" : ""} ${p.ns.map((n) => `#${n}`).join(", ")}`;

export function StepPointMark({ point, compact = false, onSelect }: { point: StepPoint; compact?: boolean; onSelect?: (stepId: string) => void }) {
  if (point.state === "current") {
    const size = compact ? "h-7 w-7" : "h-9 w-9";
    return (
      <span data-step-point="current" role="img" aria-label={`Current: ${label(point)}`} title="Current" className={`relative flex ${size} items-center justify-center`}>
        <span aria-hidden="true" className="ring-ping absolute inset-0 rounded-full border-2 border-bronze-400" />
        <span aria-hidden="true" className="absolute inset-0.5 rounded-full border-2 border-bronze-400 shadow-glow" />
      </span>
    );
  }
  const done = point.state === "done";
  const select = () => onSelect?.(point.stepIds[0]!);
  return (
    <button
      type="button"
      data-step-point={point.state}
      aria-label={`${label(point)}${done ? ", done" : ""}`}
      title={`${label(point)}${done ? " · Done" : ""}`}
      onClick={select}
      className="press flex h-5 w-5 items-center justify-center rounded-full focus-visible:outline-bronze-400"
    >
      {done ? (
        <span aria-hidden="true" className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-canvas bg-done/80 text-canvas">
          <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      ) : (
        <span aria-hidden="true" className="h-2 w-2 rounded-full border border-canvas bg-bronze-500/70" />
      )}
    </button>
  );
}
