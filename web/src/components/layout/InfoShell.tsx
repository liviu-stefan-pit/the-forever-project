/**
 * Frame for the site-wide pages (About, Credits, Addons): a plain header with a Home button back to
 * the landing page and links between these pages, the page, and the shared footer. No faction top
 * bar, timeline or game sync: these pages sit beside the landing page, not inside the Horde section.
 */
import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { SITE_NAME } from "../../config";
import { Emblem, Icon } from "../ui/Icon";
import { Footer } from "./Footer";
import { resetScrollIfPathChanged } from "./scrollReset";

const SITE_PAGES = [
  { to: "/about", label: "About" },
  { to: "/credits", label: "Credits" },
  { to: "/addons", label: "Addons" },
] as const;

const siteLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-touch items-center rounded-sm px-2 text-sm font-medium transition sm:px-2.5 ${isActive ? "bg-bronze-500/15 text-bronze-300" : "text-bronze-500/80 hover:text-ink"}`;

/** `/about#license`: scroll to the section once it is on the page. */
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
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-4">
          <Link
            to="/"
            title="Home: choose your faction"
            className="press inline-flex min-h-touch shrink-0 items-center gap-1 rounded-sm border border-bronze-500/60 bg-frame/80 px-2.5 text-sm font-semibold text-ink hover:border-bronze-400 hover:text-bronze-300"
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
            Home
          </Link>
          <Link to="/" className="ml-1 hidden min-w-0 items-center gap-2.5 sm:flex" aria-label={`${SITE_NAME}: home`}>
            {/* Faction-neutral emblem: these pages belong to the whole site, like the landing page. */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-bronze-500 bg-gradient-to-br from-horde-600 to-alliance-600 text-bronze-300">
              <Emblem className="h-5 w-5" />
            </span>
            <span className="truncate font-display text-base font-bold tracking-wide text-bronze-400">{SITE_NAME}</span>
          </Link>
          <div className="flex-1" />
          <nav aria-label="Site" className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            {SITE_PAGES.map((p) => (
              <NavLink key={p.to} to={p.to} className={siteLinkClass}>
                {p.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
