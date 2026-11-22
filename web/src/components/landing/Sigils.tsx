/**
 * Original faction sigils for the landing page. These are drawn for this project on purpose:
 * they are not Blizzard's faction crests, which are trademarks (plan.md Phase 0).
 */
import { useId } from "react";

/** Horde: a spiked iron ring, crossed axes and a tusked boss. Red and bronze. */
export function HordeSigil({ className = "h-32 w-32" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const ring = spikedRing(60, 62, 56, 46, 14);
  return (
    <svg viewBox="0 0 120 124" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id={`${id}-fill`} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#9b2c2c" />
          <stop offset="70%" stopColor="#5c1414" />
          <stop offset="100%" stopColor="#2a0a0a" />
        </radialGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9a3" />
          <stop offset="45%" stopColor="#e0b85a" />
          <stop offset="100%" stopColor="#6b542e" />
        </linearGradient>
      </defs>
      <polygon points={ring} fill={`url(#${id}-fill)`} stroke={`url(#${id}-metal)`} strokeWidth="3" strokeLinejoin="miter" />
      <circle cx="60" cy="62" r="36" fill="none" stroke="#6b542e" strokeWidth="1.5" opacity="0.8" />
      {[-38, 38].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 60 62)`}>
          <rect x="57.5" y="20" width="5" height="86" rx="2" fill="#3d2a10" stroke="#6b542e" strokeWidth="1" />
          <path
            d={deg > 0 ? "M62 22 C80 12 92 28 88 48 C80 40 70 40 62 44 Z" : "M58 22 C40 12 28 28 32 48 C40 40 50 40 58 44 Z"}
            fill={`url(#${id}-metal)`}
            stroke="#3d2a10"
            strokeWidth="1"
          />
          <path d={deg > 0 ? "M58 26 L49 31 L58 37 Z" : "M62 26 L71 31 L62 37 Z"} fill="#c6a15a" />
        </g>
      ))}
      <circle cx="60" cy="64" r="15" fill="#2a0a0a" stroke={`url(#${id}-metal)`} strokeWidth="3" />
      <path d="M52 58 C53 68 56 73 59 75 C57 69 56 63 56 58 Z M68 58 C67 68 64 73 61 75 C63 69 64 63 64 58 Z" fill="#f3ead7" />
    </svg>
  );
}

/** Alliance: a kite shield with a four-point star and a crown of light. Blue, silver and pale gold. */
export function AllianceSigil({ className = "h-32 w-32" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 124" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f4e9c" />
          <stop offset="60%" stopColor="#102a56" />
          <stop offset="100%" stopColor="#0a1020" />
        </linearGradient>
        <linearGradient id={`${id}-silver`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef2f7" />
          <stop offset="55%" stopColor="#9aa8bb" />
          <stop offset="100%" stopColor="#4a5668" />
        </linearGradient>
        <linearGradient id={`${id}-star`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#e8d18a" />
          <stop offset="100%" stopColor="#c9a64a" />
        </linearGradient>
      </defs>
      {[42, 60, 78].map((x, i) => (
        <path key={x} d={`M${x} ${i === 1 ? 2 : 8} L${x + 4} ${i === 1 ? 10 : 15} L${x} ${i === 1 ? 18 : 22} L${x - 4} ${i === 1 ? 10 : 15} Z`} fill={`url(#${id}-star)`} />
      ))}
      <path d="M60 22 L102 32 L102 64 C102 90 84 106 60 118 C36 106 18 90 18 64 L18 32 Z" fill={`url(#${id}-fill)`} stroke={`url(#${id}-silver)`} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M60 30 L94 38 L94 64 C94 85 80 99 60 109 C40 99 26 85 26 64 L26 38 Z" fill="none" stroke="#e8d18a" strokeWidth="1" opacity="0.55" />
      <path d="M60 36 V104 M30 62 H90" stroke="#9aa8bb" strokeWidth="1" opacity="0.35" />
      <circle cx="60" cy="66" r="20" fill="none" stroke={`url(#${id}-silver)`} strokeWidth="1.5" opacity="0.8" />
      <path d="M60 40 L66 60 L86 66 L66 72 L60 92 L54 72 L34 66 L54 60 Z" fill={`url(#${id}-star)`} stroke="#4a5668" strokeWidth="0.8" />
      <circle cx="60" cy="66" r="3.5" fill="#1f4e9c" />
    </svg>
  );
}

/** Alternating outer/inner radius points around a centre: a saw-toothed iron ring. */
function spikedRing(cx: number, cy: number, outer: number, inner: number, spikes: number): string {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}
