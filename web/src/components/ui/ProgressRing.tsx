/** Circular progress ring. `value` 0..1; `undefined` = unknown (guide not loaded yet). */
export function ProgressRing({
  value,
  size = 28,
  stroke = 3,
  label,
  tone = "gold",
}: {
  value: number | undefined;
  size?: number;
  stroke?: number;
  label?: string;
  tone?: "horde" | "gold" | "forever";
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const unknown = value === undefined;
  const v = unknown ? 0 : Math.min(1, Math.max(0, value));
  const complete = !unknown && v >= 1;
  const color = complete ? "#3d9a5a" : tone === "forever" ? "#c45c54" : tone === "horde" ? "#c6a15a" : "#c6a15a";
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      data-progress={unknown ? "unknown" : String(v)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#6b542e"
          strokeWidth={stroke}
          strokeDasharray={unknown ? "1.5 2.5" : undefined}
          opacity={unknown ? 0.45 : 1}
        />
        {!unknown && v > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - v)}
            className="transition-[stroke-dashoffset] duration-500"
          />
        )}
      </svg>
      {label !== undefined && (
        <span className={`absolute text-[9px] font-semibold tabular-nums ${complete ? "text-bronze-400" : "text-ink"}`}>
          {label}
        </span>
      )}
    </span>
  );
}
