/**
 * Frame for the site-wide pages (About, Credits, Addons): a plain header with the site name and a
 * way back into the Horde guide, the page, and the shared footer. No faction top bar, timeline or
 * game sync: these pages belong to the whole site, not to the Horde section.
 */
import { useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { HORDE_HOME, SITE_NAME } from "../../config";
import { Emblem, Icon } from "../ui/Icon";
import { Footer } from "./Footer";
import { resetScrollIfPathChanged } from "./scrollReset";

/** `#/about#license`: scroll to the section once it is on the page. */
function scrollToHash(hash: string): boolean {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ block: "start" });
  return true;
}

export function InfoShell() {
  const location = useLocation();
  const prevPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!location.hash) resetScrollIfPathChanged(prevPathname.current, location.pathname);
    prevPathname.current = location.pathname;
  }, [location.pathname, location.hash]);

  // Pages are lazy: retry for a moment until the anchored section has rendered.
  useEffect(() => {
    if (!location.hash) return;
    let tries = 0;
    let timer: number | undefined;
    const attempt = () => {
      if (scrollToHash(location.hash) || ++tries > 20) return;
      timer = window.setTimeout(attempt, 50);
    };
    attempt();
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  return (
    <div className="azeroth-bg flex min-h-screen flex-col">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
        className="sr-only z-[70] rounded-sm border border-bronze-500 bg-horde-500 px-3 py-2 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-stroke bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-3 sm:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label={`${SITE_NAME} — home`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-bronze-500 bg-gradient-to-br from-horde-500 to-horde-700 text-bronze-300">
              <Emblem className="h-5 w-5" />
            </span>
            <span className="truncate font-display text-base font-bold tracking-wide text-bronze-400">{SITE_NAME}</span>
          </Link>
          <div className="flex-1" />
          <Link
            to={HORDE_HOME}
            className="press inline-flex min-h-touch shrink-0 items-center gap-1.5 rounded-sm border border-bronze-500/60 bg-frame/80 px-3 text-sm font-semibold text-ink hover:border-bronze-400 hover:text-bronze-300"
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
            <span className="sm:hidden">Horde guide</span>
            <span className="hidden sm:inline">Back to the Horde guide</span>
          </Link>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
