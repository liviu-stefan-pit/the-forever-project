/**
 * A faction card on the landing page: a tall framed panel that tilts towards the pointer, catches
 * a glare, and runs a light around its border on hover. The Horde card is a link; the Alliance
 * card is locked (focusable so screen readers hear "coming soon", but it goes nowhere).
 */
import { useRef, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from "react";

export type Faction = "horde" | "alliance";

interface Props {
  faction: Faction;
  /** Locked cards are not links. */
  href?: string;
  label: string;
  describedBy?: string;
  onActivate?: (e: MouseEvent<HTMLAnchorElement>, rect: DOMRect) => void;
  onHover: (f: Faction | null) => void;
  delayMs: number;
  children: ReactNode;
}

function tiltAllowed(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function FactionCard({ faction, href, label, describedBy, onActivate, onHover, delayMs, children }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  const onMove = (e: PointerEvent) => {
    const el = ref.current;
    if (!el || !tiltAllowed()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - py) * 10).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * 12).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
  };
  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    onHover(null);
  };

  const locked = !href;
  const className = `faction-card faction-${faction} landing-rise group relative block h-full rounded-2xl text-left outline-none ${locked ? "is-locked cursor-default" : "cursor-pointer"}`;
  const style = { animationDelay: `${delayMs}ms` } as CSSProperties;
  const common = {
    className,
    style,
    onPointerEnter: () => onHover(faction),
    onPointerMove: onMove,
    onPointerLeave: reset,
    onFocus: () => onHover(faction),
    onBlur: () => onHover(null),
  };
  const inner = (
    <>
      <span className="faction-border" aria-hidden="true" />
      <span className="faction-glare" aria-hidden="true" />
      <span className="relative z-[1] flex h-full flex-col items-center px-6 pb-7 pt-6 text-center sm:px-8">{children}</span>
    </>
  );

  if (locked) {
    return (
      <article ref={(el) => void (ref.current = el)} tabIndex={0} aria-label={label} aria-describedby={describedBy} aria-disabled="true" {...common}>
        {inner}
      </article>
    );
  }
  return (
    <a
      ref={(el) => void (ref.current = el)}
      href={href}
      aria-label={label}
      aria-describedby={describedBy}
      onClick={(e) => {
        if (!onActivate || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        onActivate(e, (ref.current ?? e.currentTarget).getBoundingClientRect());
      }}
      {...common}
    >
      {inner}
    </a>
  );
}
