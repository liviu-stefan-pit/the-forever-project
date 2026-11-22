/** A touch-only device (phone / tablet with no mouse). Matches the Tailwind `touch:` screen. */
export const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";

export function isTouchOnly(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.(TOUCH_QUERY).matches;
}
