/** Shell-level UI state (search dialog, timeline drawer), shared through context. */
import { createContext, useContext } from "react";

export interface UiState {
  searchOpen: boolean;
  openSearch(): void;
  closeSearch(): void;
  /** Mobile timeline drawer. */
  drawerOpen: boolean;
  setDrawerOpen(open: boolean): void;
  /** Desktop timeline rail collapsed. */
  timelineCollapsed: boolean;
  setTimelineCollapsed(collapsed: boolean): void;
}

export const UiContext = createContext<UiState | null>(null);

export function useUi(): UiState {
  const ui = useContext(UiContext);
  if (!ui) throw new Error("useUi() outside <AppShell>");
  return ui;
}

/** localStorage helpers for per-viewer conveniences; never throw. */
export function readPref(key: string): string | null {
  try {
    return localStorage.getItem(`hgw:pref:${key}`);
  } catch {
    return null;
  }
}
export function writePref(key: string, value: string): void {
  try {
    localStorage.setItem(`hgw:pref:${key}`, value);
  } catch {
    /* private mode etc. */
  }
}
