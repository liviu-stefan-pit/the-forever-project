/** Marker shapes by kind (DESIGN.md §4). Shape + letter carry the meaning, not colour alone. */
import type { MarkerKind } from "../../data/schema";
import { MARKER_LABEL } from "../../lib/mapMarkers";

const CANVAS = "#120c0a";

export function MarkerGlyph({ kind, size = 22, className }: { kind: MarkerKind; size?: number; className?: string }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", className, "aria-hidden": true } as const;
  switch (kind) {
    case "questGiver":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" fill="#e0b85a" stroke={CANVAS} strokeWidth="2" />
          <path d="M12 6.5v7M12 16.8v.4" stroke={CANVAS} strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case "turnIn":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" fill="#9b2c2c" stroke={CANVAS} strokeWidth="2" />
          <path d="M9.4 9.4a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.2-2.6 3.8M12 17v.3" stroke="#f3ead7" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "vendor":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#c084fc" stroke={CANVAS} strokeWidth="2" />
          <path d="M8 10h8l-1 6H9z" fill={CANVAS} />
        </svg>
      );
    case "trainer":
      return (
        <svg {...common}>
          <rect x="5" y="5" width="14" height="14" rx="1.5" transform="rotate(45 12 12)" fill="#7eb3e0" stroke={CANVAS} strokeWidth="2" />
          <path d="M12 8v8M8 12h8" stroke={CANVAS} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "flightPath":
      return (
        <svg {...common}>
          <path d="M12 22c-4-4.5-7-8-7-11.5a7 7 0 0 1 14 0C19 14 16 17.5 12 22z" fill="#ffe9a3" stroke={CANVAS} strokeWidth="2" />
          <path d="M7.5 10.5c2-.2 3.3.4 4.5 1.8 1.2-1.4 2.5-2 4.5-1.8" stroke={CANVAS} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "innkeeper":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="9" fill="#c6a15a" stroke={CANVAS} strokeWidth="2" />
          <path d="M7 15V9M7 12h10v3M11 12V9.5h6V12" stroke={CANVAS} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
        </svg>
      );
    case "object":
      return (
        <svg {...common}>
          <path d="M12 2.5 21 12l-9 9.5L3 12z" fill="#c4b496" stroke={CANVAS} strokeWidth="2" />
          <circle cx="12" cy="12" r="2.4" fill={CANVAS} />
        </svg>
      );
    case "mobArea":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="12" rx="10" ry="7.5" fill="rgba(212,74,58,0.3)" stroke="#f3ead7" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M9 11h.01M15 11h.01M10 14.5h4" stroke="#ff5a4a" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

export function MapLegend({ kinds, className = "" }: { kinds: readonly MarkerKind[]; className?: string }) {
  if (!kinds.length) return null;
  return (
    <ul aria-label="Map legend" className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted ${className}`}>
      {kinds.map((k) => (
        <li key={k} className="inline-flex items-center gap-1">
          <MarkerGlyph kind={k} size={14} />
          {MARKER_LABEL[k]}
        </li>
      ))}
    </ul>
  );
}
