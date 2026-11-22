/** Map stop number badge, e.g. ③. Matches the numbered markers on the zone map (P8). */
export function StopBadge({ n, bonus = false, size = "md" }: { n: number; bonus?: boolean; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-5 min-w-5 text-[10px]" : "h-6 min-w-6 text-[11px]";
  return (
    <span
      className={`inline-flex ${dim} items-center justify-center rounded-full border px-1 font-bold tabular-nums shadow-sm ${
        bonus
          ? "border-bronze-400/70 bg-bronze-900/70 text-bronze-300"
          : "border-bronze-400/70 bg-horde-700/70 text-bronze-300"
      }`}
      title={`Map stop ${n}`}
      aria-label={`Map stop ${n}`}
    >
      {n}
    </span>
  );
}
