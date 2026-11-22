/**
 * Dashboard hero map: the zone image fitted around where you are and the next stops.
 * Faint line = the last few spots you passed, dashed gold = the way ahead, numbers match "Up next".
 */
import { useMemo, useState } from "react";
import { fitMapView, framePct, MAP_VIEW, routePathD, toMapSpace, type ZonePoint } from "../map/route";
import type { Spot } from "../../lib/dashboard";

export interface RouteMapStop {
  n: number;
  spot: Spot;
  title: string;
}

export function RouteMap({
  zoneImage,
  zoneName,
  trail,
  current,
  stops,
}: {
  zoneImage?: string;
  zoneName: string;
  /** Recent done spots, oldest first. */
  trail: readonly ZonePoint[];
  current?: Spot;
  stops: readonly RouteMapStop[];
}) {
  const [imgOk, setImgOk] = useState(true);
  const fit = useMemo(
    () => fitMapView([...trail.slice(-6), ...(current ? [current] : []), ...stops.map((s) => s.spot)], 7),
    [trail, current, stops],
  );
  const u = fit.w / 100;
  const ahead = [...(current ? [current] : []), ...stops.map((s) => s.spot)];
  const trailD = trail.length + (current ? 1 : 0) >= 2 ? routePathD([...trail, ...(current ? [current] : [])].map(toMapSpace)) : "";
  const aheadD = ahead.length >= 2 ? routePathD(ahead.map(toMapSpace)) : "";
  const pos = (p: ZonePoint) => {
    const pct = framePct(p, fit);
    return { left: `${pct.left}%`, top: `${pct.top}%` };
  };
  const label = `Map of ${zoneName}: ${current ? "you are here, then " : ""}${stops.map((s) => `stop ${s.n}, ${s.title}`).join("; ")}`;

  return (
    <div className={`${imgOk && zoneImage ? "" : "map-grid "}relative aspect-[3/2] w-full overflow-hidden bg-canvas`}>
      <svg
        viewBox={`${fit.x} ${fit.y} ${fit.w} ${fit.h}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={label}
      >
        {imgOk && zoneImage && (
          <image
            href={zoneImage}
            x={0}
            y={0}
            width={MAP_VIEW.w}
            height={MAP_VIEW.h}
            preserveAspectRatio="none"
            opacity={0.85}
            onError={() => setImgOk(false)}
          />
        )}
        {trailD && <path d={trailD} fill="none" stroke="#120c0a" strokeOpacity={0.6} strokeWidth={u * 1.1} strokeLinejoin="round" strokeLinecap="round" />}
        {trailD && <path d={trailD} fill="none" stroke="#c4b496" strokeOpacity={0.55} strokeWidth={u * 0.5} strokeLinejoin="round" strokeLinecap="round" />}
        {aheadD && <path d={aheadD} fill="none" stroke="#120c0a" strokeWidth={u * 1.5} strokeLinejoin="round" strokeLinecap="round" />}
        {aheadD && (
          <path
            d={aheadD}
            fill="none"
            stroke="#e0b85a"
            strokeWidth={u * 0.75}
            strokeDasharray={`${u * 2} ${u * 1.5}`}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
      </svg>

      {stops.map((s) => (
        <span
          key={s.n}
          aria-hidden="true"
          title={s.title}
          className="absolute flex h-6 min-w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-bronze-400 bg-frame px-1 text-[11px] font-bold tabular-nums text-bronze-300 shadow-card"
          style={pos(s.spot)}
        >
          {s.n}
        </span>
      ))}
      {current && (
        <span aria-hidden="true" className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center" style={pos(current)}>
          <span className="ring-ping absolute inset-0 rounded-full border-2 border-horde-400" />
          <span className="h-4 w-4 rounded-full border-2 border-bronze-300 bg-horde-500 shadow-glow" />
        </span>
      )}

      <span className="absolute left-3 top-3 rounded-sm border border-stroke bg-canvas/85 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-bronze-300">
        {zoneName}
      </span>
      <div aria-hidden="true" className="absolute bottom-3 left-3 flex flex-wrap items-center gap-3 rounded-sm border border-bronze-900 bg-canvas/85 px-2.5 py-1.5 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-bronze-300 bg-horde-500" /> You
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="20" height="6">
            <line x1="0" y1="3" x2="20" y2="3" stroke="#e0b85a" strokeWidth="3" strokeDasharray="5 4" />
          </svg>
          Ahead
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="20" height="6">
            <line x1="0" y1="3" x2="20" y2="3" stroke="#c4b496" strokeOpacity="0.7" strokeWidth="2" />
          </svg>
          Done
        </span>
      </div>
    </div>
  );
}
