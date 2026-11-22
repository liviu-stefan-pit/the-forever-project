/**
 * Phone top bar: slide it away while the reader scrolls down through steps, bring it back on any
 * scroll up. Only the CSS below `md` acts on the flag, so tablets and desktops keep a fixed bar.
 */
import { useEffect, useState } from "react";

/** Ignore jitter smaller than this (px) so momentum scrolling does not flicker the bar. */
export const SCROLL_HIDE_DELTA = 8;
/** Always show the bar near the top of the page. */
export const SCROLL_HIDE_TOP = 120;

export function nextScrollHidden(hidden: boolean, lastY: number, y: number): { hidden: boolean; anchorY: number } {
  if (y <= SCROLL_HIDE_TOP) return { hidden: false, anchorY: y };
  const dy = y - lastY;
  if (Math.abs(dy) < SCROLL_HIDE_DELTA) return { hidden, anchorY: lastY };
  return { hidden: dy > 0, anchorY: y };
}

export function useHideOnScroll(enabled: boolean): boolean {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (!enabled) {
      setHidden(false);
      return;
    }
    let anchor = window.scrollY;
    let cur = false;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const next = nextScrollHidden(cur, anchor, window.scrollY);
        anchor = next.anchorY;
        if (next.hidden !== cur) {
          cur = next.hidden;
          setHidden(cur);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [enabled]);
  return hidden;
}
