/**
 * Zone map: the selected step's leg (or a quest route), fitted to the path.
 * Other sections show the zone image only. Pan/zoom only in the full-screen view.
 */
import { memo, useEffect, useId, useMemo, useRef, useState, type PointerEvent, type Ref } from "react";
import { createPortal } from "react-dom";
import { copyText } from "../../lib/clipboard";
import { Icon } from "../ui/Icon";
import {
  fitMapView,
  framePct,
  MAP_SX,
  MAP_VIEW,
  publicAsset,
  routeArrows,
  routePathD,
  smoothRoutePath,
  stopWayCommand,
  toMapSpace,
  type MapViewBox,
  type StepLegPin,
  type ZonePoint,
} from "./route";
import type { QuestMapPin, ZoneMapSlotProps } from "./types";
import { legendKinds, MARKER_LABEL, type MapMarker } from "../../lib/mapMarkers";
import { MapLegend, MarkerGlyph } from "./MarkerGlyph";
import { StepPointMark } from "./StepPointMark";
import type { StepPoint } from "../../lib/stepPoints";

const HORDE = "#9b2c2c";
const GOLD = "#c6a15a";
const OBSIDIAN = "#120c0a";
const STROKE = "#6b542e";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

type Cam = { x: number; y: number; k: number };

function camFromFit(fit: MapViewBox): Cam {
  return { x: fit.x, y: fit.y, k: MAP_VIEW.w / fit.w };
}

/** Keep k in [1, 14] and the view overlapping the map by ~20% of the smaller size. */
function clampCam(c: Cam): Cam {
  const k = clamp(c.k, 1, 14);
  const vw = MAP_VIEW.w / k;
  const vh = MAP_VIEW.h / k;
  if (vw >= MAP_VIEW.w - 0.001 || vh >= MAP_VIEW.h - 0.001) return { k, x: 0, y: 0 };
  const marginX = 0.2 * Math.min(vw, MAP_VIEW.w);
  const marginY = 0.2 * Math.min(vh, MAP_VIEW.h);
  return {
    k,
    x: clamp(c.x, marginX - vw, MAP_VIEW.w - marginX),
    y: clamp(c.y, marginY - vh, MAP_VIEW.h - marginY),
  };
}

/** Zoom keeping the fractional point (fracX, fracY) of the view fixed, then clamp. */
function zoomCam(c: Cam, factor: number, fracX: number, fracY: number): Cam {
  const w = MAP_VIEW.w / c.k;
  const h = MAP_VIEW.h / c.k;
  const zx = c.x + fracX * w;
  const zy = c.y + fracY * h;
  const k = clamp(c.k * factor, 1, 14);
  return clampCam({ k, x: zx - fracX * (MAP_VIEW.w / k), y: zy - fracY * (MAP_VIEW.h / k) });
}

/** Letterboxed image rect inside the frame, in percent of the frame (SVG meet). */
function meetBox(frameW: number, frameH: number, vb: MapViewBox): { left: number; top: number; width: number; height: number } {
  const full = { left: 0, top: 0, width: 100, height: 100 };
  if (frameW <= 0 || frameH <= 0 || vb.w <= 0 || vb.h <= 0) return full;
  const frameAspect = frameW / frameH;
  const vbAspect = vb.w / vb.h;
  if (Math.abs(frameAspect - vbAspect) < 0.01) return full;
  if (frameAspect > vbAspect) {
    const width = (vbAspect / frameAspect) * 100;
    return { left: (100 - width) / 2, top: 0, width, height: 100 };
  }
  const height = (frameAspect / vbAspect) * 100;
  return { left: 0, top: (100 - height) / 2, width: 100, height };
}

function MapCanvas({
  section,
  zoneImage,
  routePts,
  legPins,
  questPins,
  panZoom,
  compact,
  ariaLabel,
  fit,
  markers = [],
  sectionRoute = [],
  outline,
  stepPoints = [],
  onStepPointSelect,
}: {
  section: ZoneMapSlotProps["section"];
  zoneImage?: string;
  routePts: readonly ZonePoint[];
  legPins: readonly StepLegPin[];
  questPins?: readonly QuestMapPin[];
  panZoom: boolean;
  compact: boolean;
  ariaLabel: string;
  fit: MapViewBox;
  markers?: readonly MapMarker[];
  sectionRoute?: readonly ZonePoint[];
  outline?: ZoneMapSlotProps["outline"];
  stepPoints?: readonly StepPoint[];
  onStepPointSelect?: (stepId: string) => void;
}) {
  const glowId = `mg${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const [imgOk, setImgOk] = useState(Boolean(zoneImage));
  const [hoverKey, setHoverKey] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);
  const [cam, setCam] = useState(() => clampCam(camFromFit(fit)));
  const [box, setBox] = useState({ left: 0, top: 0, width: 100, height: 100 });

  useEffect(() => setImgOk(Boolean(zoneImage)), [zoneImage]);
  useEffect(() => {
    setCam(clampCam(camFromFit(fit)));
  }, [fit]);

  const vb: MapViewBox = panZoom
    ? { x: cam.x, y: cam.y, w: MAP_VIEW.w / cam.k, h: MAP_VIEW.h / cam.k }
    : fit;

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setBox(meetBox(r.width, r.height, vb));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [vb.w, vb.h]);

  const mapRoute = useMemo(() => (routePts.length >= 2 ? routePts.map(toMapSpace) : []), [routePts]);
  const d = useMemo(() => (mapRoute.length >= 2 ? smoothRoutePath(mapRoute) : ""), [mapRoute]);
  const arrows = useMemo(() => (mapRoute.length >= 2 ? routeArrows(mapRoute) : []), [mapRoute]);
  const u = vb.w / 100;

  const pinPos = (p: ZonePoint) => {
    const pct = framePct(p, vb);
    return {
      left: `${box.left + (pct.left / 100) * box.width}%`,
      top: `${box.top + (pct.top / 100) * box.height}%`,
    };
  };

  const hoverPin = hoverKey?.startsWith("leg:") ? legPins.find((p, i) => `leg:${p.role}:${i}` === hoverKey && p.role !== "via") : undefined;
  const hoverQuest = hoverKey?.startsWith("q:") ? questPins?.[Number(hoverKey.slice(2))] : undefined;
  const hoverMarker = hoverKey?.startsWith("m:") ? markers[Number(hoverKey.slice(2))] : undefined;
  const wayPoint = hoverPin ?? hoverQuest ?? hoverMarker;
  const sectionD = useMemo(() => (sectionRoute.length >= 2 ? routePathD(sectionRoute.map(toMapSpace)) : ""), [sectionRoute]);
  const way = wayPoint ? stopWayCommand(section.zone, wayPoint.x, wayPoint.y) : undefined;

  useEffect(() => {
    if (!panZoom) return;
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const fracX = (e.clientX - rect.left) / Math.max(rect.width, 1);
      const fracY = (e.clientY - rect.top) / Math.max(rect.height, 1);
      setCam((c) => zoomCam(c, e.deltaY > 0 ? 0.88 : 1.14, fracX, fracY));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [panZoom]);

  const fitRef = useRef(fit);
  fitRef.current = fit;
  useEffect(() => {
    if (!panZoom) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setCam((c) => zoomCam(c, 1.25, 0.5, 0.5));
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setCam((c) => zoomCam(c, 1 / 1.25, 0.5, 0.5));
      } else if (e.key === "0") {
        e.preventDefault();
        setCam(clampCam(camFromFit(fitRef.current)));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panZoom]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!panZoom || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-pin], [data-map-control], button, a")) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { ...drag.current, x: e.clientX, y: e.clientY };
    setCam((c) => {
      const w = MAP_VIEW.w / c.k;
      const h = MAP_VIEW.h / c.k;
      return clampCam({ ...c, x: c.x - (dx / Math.max(rect.width, 1)) * w, y: c.y - (dy / Math.max(rect.height, 1)) * h });
    });
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  const letter = compact ? "h-6 min-w-6 text-[10px]" : "h-7 min-w-7 text-[11px]";

  return (
    <div
      ref={frameRef}
      className={`${imgOk && zoneImage ? "" : "map-grid "}relative h-full w-full overflow-hidden ${panZoom ? "cursor-grab active:cursor-grabbing touch-none" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseLeave={() => setHoverKey(undefined)}
    >
      <svg
        viewBox={`${vb.x.toFixed(3)} ${vb.y.toFixed(3)} ${vb.w.toFixed(3)} ${vb.h.toFixed(3)}`}
        preserveAspectRatio="xMidYMid meet"
        className="pointer-events-none absolute inset-0 h-full w-full"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={u * 1.1} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {imgOk && zoneImage && (
          <image
            href={zoneImage}
            x={0}
            y={0}
            width={MAP_VIEW.w}
            height={MAP_VIEW.h}
            preserveAspectRatio="none"
            onError={() => setImgOk(false)}
          />
        )}
        {(outline ?? []).map((o, i) =>
          o.ring.length >= 3 ? (
            <polygon
              key={`ol${i}`}
              points={o.ring.map((q) => `${(q.x * MAP_SX).toFixed(2)},${q.y.toFixed(2)}`).join(" ")}
              fill="none"
              stroke={STROKE}
              strokeOpacity="0.4"
              strokeWidth={u * 0.35}
              strokeLinejoin="round"
            />
          ) : null,
        )}
        {sectionD && (
          <path d={sectionD} fill="none" stroke={GOLD} strokeOpacity="0.35" strokeWidth={u * 0.35} strokeDasharray={`${u * 1.2} ${u * 0.9}`} strokeLinecap="round" />
        )}
        {markers.map((m, i) =>
          m.kind !== "mobArea" ? null : m.polygon ? (
            <polygon
              key={`mob${i}`}
              points={m.polygon.map((q) => `${(q.x * MAP_SX).toFixed(2)},${q.y.toFixed(2)}`).join(" ")}
              fill="#d44a3a"
              fillOpacity="0.25"
              stroke="#f3ead7"
              strokeOpacity="0.7"
              strokeWidth={u * 0.3}
              strokeDasharray={`${u * 0.9} ${u * 0.6}`}
            />
          ) : (
            <ellipse
              key={`mob${i}`}
              cx={m.x * MAP_SX}
              cy={m.y}
              rx={(m.radius ?? 3) * MAP_SX}
              ry={m.radius ?? 3}
              fill="#d44a3a"
              fillOpacity="0.25"
              stroke="#f3ead7"
              strokeOpacity="0.7"
              strokeWidth={u * 0.3}
              strokeDasharray={`${u * 0.9} ${u * 0.6}`}
            />
          ),
        )}
        {d && (
          <>
            <path d={d} fill="none" stroke={GOLD} strokeOpacity="0.28" strokeWidth={u * 2.4} strokeLinejoin="round" strokeLinecap="round" />
            <path
              d={d}
              fill="none"
              stroke="#ffd100"
              strokeOpacity="0.9"
              strokeWidth={u * 0.55}
              strokeLinejoin="round"
              strokeLinecap="round"
              filter={`url(#${glowId})`}
            />
          </>
        )}
        {arrows.map((a, i) => (
          <polygon
            key={`a${i}`}
            points={`${(-1.3 * u).toFixed(2)},${(-0.7 * u).toFixed(2)} ${(1.5 * u).toFixed(2)},0 ${(-1.3 * u).toFixed(2)},${(0.7 * u).toFixed(2)}`}
            fill="#ffe9a3"
            transform={`translate(${a.x.toFixed(2)} ${a.y.toFixed(2)}) rotate(${a.angle.toFixed(1)})`}
          />
        ))}
      </svg>

      {stepPoints.map((sp) => (
        <div
          key={`sp:${sp.stepIds[0]}`}
          data-pin={`sp:${sp.stepIds[0]}`}
          className={`absolute -translate-x-1/2 -translate-y-1/2 ${sp.state === "current" ? "pointer-events-none z-[3]" : "z-[1]"}`}
          style={pinPos(sp)}
        >
          <StepPointMark point={sp} compact={compact} onSelect={onStepPointSelect} />
        </div>
      ))}

      {(questPins ?? []).map((p, i) => {
        const start = p.kind === "start";
        const key = `q:${i}`;
        return (
          <div key={key} data-pin={key} className="absolute z-[1] -translate-x-1/2 -translate-y-1/2" style={pinPos(p)}>
            <button
              type="button"
              data-pin={key}
              aria-label={`${start ? "Quest giver" : "Turn-in"}: ${p.label}`}
              title={`${p.label} · ${stopWayCommand(section.zone, p.x, p.y) ?? ""}`}
              onMouseEnter={() => setHoverKey(key)}
              onFocus={() => setHoverKey(key)}
              className={`press relative flex ${compact ? "h-7 w-7" : "h-9 w-9"} items-center justify-center rounded-full drop-shadow focus-visible:outline-bronze-400`}
            >
              <MarkerGlyph kind={start ? "questGiver" : "turnIn"} size={compact ? 18 : 22} />
            </button>
          </div>
        );
      })}

      {markers.map((m, i) => {
        const key = `m:${i}`;
        const mob = m.kind === "mobArea";
        return (
          <div key={key} data-pin={key} className="absolute z-[1] -translate-x-1/2 -translate-y-1/2" style={pinPos(m)}>
            <button
              type="button"
              data-pin={key}
              data-marker={m.kind}
              aria-label={`${MARKER_LABEL[m.kind]}: ${m.label}`}
              title={`${m.label} (${MARKER_LABEL[m.kind]})`}
              onMouseEnter={() => setHoverKey(key)}
              onFocus={() => setHoverKey(key)}
              className={`press relative flex ${compact ? "h-7 w-7" : "h-9 w-9"} items-center justify-center rounded-full focus-visible:outline-bronze-400 ${mob ? "opacity-80 hover:opacity-100" : "drop-shadow"}`}
            >
              <MarkerGlyph kind={m.kind} size={compact ? (mob ? 14 : 18) : mob ? 16 : 22} />
            </button>
          </div>
        );
      })}

      {legPins.map((p, i) => {
        const key = `leg:${p.role}:${i}`;
        // A typed giver / turn-in / NPC marker on the same spot says more than the A/B letter.
        if (p.role !== "via" && markers.some((m) => m.kind !== "mobArea" && Math.hypot(m.x - p.x, m.y - p.y) < 1.2)) return null;
        if (p.role === "via") {
          return (
            <span
              key={key}
              className="pointer-events-none absolute z-[1] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{ ...pinPos(p), backgroundColor: GOLD, borderColor: OBSIDIAN }}
              aria-hidden="true"
            />
          );
        }
        const a = p.role === "a";
        const fill = a ? GOLD : HORDE;
        return (
          <div key={key} data-pin={key} className="absolute z-[1] -translate-x-1/2 -translate-y-1/2" style={pinPos(p)}>
            <button
              type="button"
              data-pin={key}
              aria-label={a ? "Point A" : "Point B"}
              title={stopWayCommand(section.zone, p.x, p.y)}
              onMouseEnter={() => setHoverKey(key)}
              onFocus={() => setHoverKey(key)}
              className={`relative flex ${letter} items-center justify-center rounded-full border px-1 font-bold shadow-sm focus-visible:outline-bronze-400`}
              style={{ backgroundColor: fill, borderColor: OBSIDIAN, color: a ? OBSIDIAN : "#fff" }}
            >
              {a ? "A" : "B"}
            </button>
          </div>
        );
      })}

      {way && (
        <div className="parchment fade-in pointer-events-auto absolute inset-x-1.5 bottom-1.5 z-[2] rounded-sm border border-bronze-500 px-2.5 py-1.5 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate font-mono text-[11px] text-parchment-ink">
              {hoverMarker && <span className="mr-1.5 font-sans font-semibold">{hoverMarker.label} ·</span>}
              {way}
            </p>
            <button
              type="button"
              data-pin="copy"
              className="shrink-0 inline-flex items-center gap-1 rounded-sm border border-bronze-500/70 bg-parchment px-1.5 py-0.5 font-mono text-[10px] text-parchment-ink hover:border-horde-500 hover:text-horde-400"
              title={`Copy "${way}" (TomTom)`}
              aria-label={`Copy waypoint ${way}`}
              onClick={async () => {
                if (await copyText(way)) {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1400);
                }
              }}
            >
              <Icon name={copied ? "check" : "copy"} className="h-3 w-3 text-bronze-400" />
              {copied ? "copied" : "/way"}
            </button>
          </div>
        </div>
      )}

      {panZoom && (
        <div data-map-control className="absolute right-2 top-2 z-[2] flex flex-col gap-1">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-bronze-500/60 bg-canvas/85 text-sm text-ink hover:border-horde-500/50 hover:text-bronze-300"
            aria-label="Zoom in"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setCam((c) => zoomCam(c, 1.25, 0.5, 0.5))}
          >
            +
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-bronze-500/60 bg-canvas/85 text-sm text-ink hover:border-horde-500/50 hover:text-bronze-300"
            aria-label="Zoom out"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setCam((c) => zoomCam(c, 1 / 1.25, 0.5, 0.5))}
          >
            −
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-bronze-500/60 bg-canvas/85 text-[10px] text-ink hover:border-horde-500/50 hover:text-bronze-300"
            aria-label="Fit route"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setCam(clampCam(camFromFit(fit)))}
          >
            Fit
          </button>
        </div>
      )}
    </div>
  );
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  );
}

function ZoneMapSlotImpl(props: ZoneMapSlotProps) {
  const { section, zone, variant, position, leg, caption, routePoints, questPins, markers, sectionRoute, stepPoints, onStepPointSelect } = props;
  const hostRef = useRef<HTMLElement | null>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = hostRef.current;
    if (!el) {
      setNear(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true);
      },
      { root: null, rootMargin: "100% 0px 100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const outline = props.outline ?? zone?.outline;
  const legend = useMemo(() => {
    const kinds = legendKinds(markers ?? []);
    if (questPins?.length) {
      for (const k of ["questGiver", "turnIn"] as const) if (questPins.some((p) => (p.kind === "start") === (k === "questGiver")) && !kinds.includes(k)) kinds.unshift(k);
    }
    return kinds;
  }, [markers, questPins]);
  const questMode = props.mode === "quest";
  const [full, setFull] = useState(false);
  const src = near ? publicAsset(zone?.image) : undefined;
  const levels = zone?.levels ? `Lv ${zone.levels[0]}–${zone.levels[1]}` : undefined;
  const source = questMode ? routePoints : leg?.path;
  const routeKey = (source ?? []).map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(";");
  const routePts = useMemo(() => source ?? [], [routeKey]);
  const pinCount = questMode ? (questPins?.length ?? 0) : (leg?.pins.length ?? 0);
  const fit = useMemo(
    () => fitMapView(routePts.length >= 2 || pinCount > 0 ? routePts : []),
    [routePts, pinCount],
  );
  const captionLine = caption?.trim() ? caption : (levels ?? "");
  const ariaLabel = questMode
    ? `Quest route map of ${section.zone}`
    : leg
      ? `Step route map of ${section.zone}`
      : `Map of ${section.zone}`;

  useEffect(() => {
    if (!full) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [full]);

  const canvas = (panZoom: boolean, compact: boolean) => (
    <MapCanvas
      section={section}
      zoneImage={src}
      routePts={routePts}
      legPins={questMode ? [] : (leg?.pins ?? [])}
      questPins={questMode ? questPins : undefined}
      panZoom={panZoom}
      compact={compact}
      ariaLabel={ariaLabel}
      fit={fit}
      markers={markers}
      sectionRoute={questMode ? undefined : sectionRoute}
      outline={outline}
      stepPoints={questMode ? undefined : stepPoints}
      onStepPointSelect={onStepPointSelect}
    />
  );

  const tools = (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={() => setFull(true)}
        className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-sm border border-stroke p-1.5 text-bronze-500/80 transition hover:border-horde-500/50 hover:text-bronze-300"
        aria-label={`Open ${section.zone} map full screen`}
        title="Full screen — pan and zoom"
      >
        <ExpandIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  const dialog =
    full && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[70] flex h-[100dvh] flex-col bg-canvas/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pl-[max(1.25rem,env(safe-area-inset-left))] sm:pr-[max(1.25rem,env(safe-area-inset-right))] sm:pt-[max(1.25rem,env(safe-area-inset-top))]"
            role="dialog"
            aria-modal="true"
            aria-label={`${section.zone} full screen map`}
          >
      <div className="fade-in mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-bold text-bronze-400">{section.zone}</h2>
          <p className="truncate text-[11px] text-bronze-500/80 [@media(max-height:500px)]:hidden">{captionLine} · drag to pan, scroll to zoom</p>
          <MapLegend kinds={legend} className="mt-1 [@media(max-height:500px)]:hidden" />
        </div>
        <button
          type="button"
          onClick={() => setFull(false)}
          className="inline-flex min-h-touch min-w-touch shrink-0 self-start items-center justify-center rounded-sm border border-bronze-500/60 p-2 text-ink hover:text-bronze-300"
          aria-label="Close full screen map"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
      </div>
      <div
        className="relative min-h-0 flex-1 overflow-hidden rounded-sm border border-stroke"
        style={{ containerType: "size" }}
      >
        <div
          className="absolute left-1/2 top-1/2 aspect-[3/2] -translate-x-1/2 -translate-y-1/2"
          style={{ width: "min(100cqw, calc(100cqh * 1.5))" }}
        >
          {canvas(true, false)}
        </div>
      </div>
          </div>,
          document.body,
        )
      : null;

  if (variant === "panel") {
    return (
      <section ref={hostRef as Ref<HTMLElement>} aria-label={`${section.zone} map`} className="wow-frame overflow-hidden shadow-card">
        <div className="flex items-center justify-between gap-2 border-b border-stroke px-4 py-2.5">
          <div className="min-w-0">
            <h2 className="truncate font-display text-sm font-bold tracking-wide text-bronze-400">{section.zone}</h2>
            <p className="truncate text-[11px] text-bronze-500/80">{captionLine}</p>
          </div>
          {tools}
        </div>
        <div className="relative aspect-[3/2] w-full">{canvas(false, false)}</div>
        {legend.length > 0 && <MapLegend kinds={legend} className="border-t border-stroke px-4 py-2" />}
        {dialog}
      </section>
    );
  }

  return (
    <header ref={hostRef as Ref<HTMLElement>} className="wow-frame relative overflow-hidden shadow-card">
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:p-4">
        <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-sm border border-stroke sm:w-64 md:w-72">
          {canvas(false, true)}
          <div className="absolute right-1.5 top-1.5 z-[3]">{tools}</div>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-bronze-400">
            <Icon name="map" className="h-3.5 w-3.5" />
            {position ? `Zone ${position.index} of ${position.total}` : "Zone"}
          </div>
          <h2 className="font-display text-2xl font-bold leading-tight text-bronze-400 sm:text-[1.7rem]">{section.zone}</h2>
          <p className="text-xs text-bronze-500/80">{captionLine}</p>
          <MapLegend kinds={legend} />
        </div>
      </div>
      {dialog}
    </header>
  );
}

export const ZoneMapSlot = memo(ZoneMapSlotImpl);
