/**
 * Keep the screen awake while a guide is open (Screen Wake Lock API), for a phone used as a second
 * screen. The choice is a per-browser convenience in localStorage. The browser drops the lock when
 * the tab is hidden, so it is taken again when the page is visible.
 */
import { useCallback, useEffect, useState } from "react";

const KEY = "tfp.keepAwake";

interface Sentinel {
  release(): Promise<void>;
  addEventListener(type: "release", cb: () => void): void;
}
type WakeNavigator = Navigator & { wakeLock?: { request(type: "screen"): Promise<Sentinel> } };

export function wakeLockSupported(): boolean {
  return typeof navigator !== "undefined" && !!(navigator as WakeNavigator).wakeLock;
}

function readPref(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function writePref(on: boolean): void {
  try {
    if (on) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    /* private mode: the toggle still works for this visit */
  }
}

/** `[on, setOn, held]`: the saved choice, a setter, and whether the browser holds the lock now. */
export function useKeepAwake(): [boolean, (on: boolean) => void, boolean] {
  const [on, setOnState] = useState(readPref);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!on || !wakeLockSupported()) return;
    let sentinel: Sentinel | null = null;
    let live = true;
    const take = async () => {
      if (document.visibilityState !== "visible" || sentinel) return;
      try {
        const s = await (navigator as WakeNavigator).wakeLock!.request("screen");
        if (!live) {
          void s.release();
          return;
        }
        sentinel = s;
        setHeld(true);
        s.addEventListener("release", () => {
          sentinel = null;
          if (live) setHeld(false);
        });
      } catch {
        setHeld(false);
      }
    };
    void take();
    const onVis = () => void take();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      live = false;
      document.removeEventListener("visibilitychange", onVis);
      void sentinel?.release();
      setHeld(false);
    };
  }, [on]);

  const setOn = useCallback((v: boolean) => {
    writePref(v);
    setOnState(v);
  }, []);
  return [on, setOn, held];
}
