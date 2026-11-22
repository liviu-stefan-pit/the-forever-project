/** App frame: top bar, collapsible left timeline (drawer on mobile), routed content, search. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Footer } from "./Footer";
import { GameSyncProvider } from "../../state/gameSyncClient";
import { commandForKey } from "../../state/keyboard";
import { readPref, UiContext, writePref, type UiState } from "../../state/ui";
import { Icon } from "../ui/Icon";
import { SearchDialog } from "./SearchDialog";
import { DrawerNav } from "./MainNav";
import { Timeline } from "./Timeline";
import { TopBar } from "./TopBar";
import { resetScrollIfPathChanged } from "./scrollReset";

function Drawer({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Level timeline">
      <div className="fade-in absolute inset-0 bg-canvas/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="drawer-in absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col border-r border-stroke bg-frame shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-1.5 top-1.5 z-10 inline-flex min-h-touch min-w-touch items-center justify-center rounded-sm p-1.5 text-bronze-500/80 hover:bg-canvas hover:text-bronze-300"
          aria-label="Close timeline"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
        <DrawerNav onNavigate={onClose} />
        <div className="flex min-h-0 flex-1 flex-col">
          <Timeline />
        </div>
      </div>
    </div>
  );
}

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [timelineCollapsed, setCollapsed] = useState(() => readPref("timelineCollapsed") === "1");
  const location = useLocation();

  const setTimelineCollapsed = useCallback((c: boolean) => {
    setCollapsed(c);
    writePref("timelineCollapsed", c ? "1" : "0");
  }, []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const ui = useMemo<UiState>(
    () => ({ searchOpen, openSearch, closeSearch, drawerOpen, setDrawerOpen, timelineCollapsed, setTimelineCollapsed }),
    [searchOpen, openSearch, closeSearch, drawerOpen, timelineCollapsed, setTimelineCollapsed],
  );

  // Close the drawer on navigation.
  useEffect(() => setDrawerOpen(false), [location.pathname, location.search]);

  // Hash-route page changes leave the window scroll where it was, so a long
  // Profiles or Overview visit would open the next page mid-content (especially
  // on a phone, where the title sits above the fold). Step deep links only
  // change the query string and must keep their own scroll.
  const prevPathname = useRef<string | undefined>(undefined);
  useEffect(() => {
    resetScrollIfPathChanged(prevPathname.current, location.pathname);
    prevPathname.current = location.pathname;
  }, [location.pathname]);

  // Global shortcut: "/" or Ctrl+K opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const cmd = commandForKey({ key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, targetTag: t?.tagName, targetEditable: t?.isContentEditable });
      if (cmd === "search") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <GameSyncProvider>
    <UiContext.Provider value={ui}>
      <div className="azeroth-bg min-h-screen">
        <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }} className="sr-only z-[70] rounded-sm border border-bronze-500 bg-horde-500 px-3 py-2 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
          Skip to content
        </a>
        <TopBar />
        <div className="flex">
          <aside
            className={`sticky top-[var(--topbar-h)] hidden h-[calc(100vh-var(--topbar-h))] shrink-0 border-r border-stroke bg-frame/80 backdrop-blur-sm transition-[width] duration-300 lg:block ${
              timelineCollapsed ? "w-[68px]" : "w-72"
            }`}
          >
            <Timeline collapsed={timelineCollapsed} onToggleCollapsed={() => setTimelineCollapsed(!timelineCollapsed)} />
          </aside>
          <main id="main" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
            <Outlet />
            <Footer />
          </main>
        </div>
        {drawerOpen && <Drawer onClose={closeDrawer} />}
        {searchOpen && <SearchDialog />}
      </div>
    </UiContext.Provider>
    </GameSyncProvider>
  );
}
