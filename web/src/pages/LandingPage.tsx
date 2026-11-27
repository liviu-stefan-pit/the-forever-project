/**
 * `/`: the faction landing page. Two big cards on a background where the Horde and Alliance
 * themes meet: Horde is live, Alliance is "coming soon". It sits outside the app shell and loads
 * only `landing.json` (a few bytes), so it paints fast; the Horde dashboard lives at `/horde`.
 */
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router";
import { FactionCard, type Faction } from "../components/landing/FactionCard";
import { FusionBackground } from "../components/landing/FusionBackground";
import { AllianceSigil, HordeSigil } from "../components/landing/Sigils";
import { EXPERIMENTAL_HREF, StatusBadge } from "../components/ui/ExperimentalBadge";
import { Icon, type IconName } from "../components/ui/Icon";
import { HORDE_HOME, SITE_NAME } from "../config";
import { loadLandingStats, type LandingStats } from "../data/loader";
import { useActiveProfileSummary } from "../state/profile";
import "../components/landing/landing.css";

const reducedMotion = () => typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

/** Counts up from 0 once `target` is known (ease-out, ~1.2 s). */
function useCountUp(target: number | undefined, delayMs: number): number | undefined {
  const [v, setV] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (target === undefined) return;
    if (reducedMotion()) {
      setV(target);
      return;
    }
    let raf = 0;
    const start = performance.now() + delayMs;
    const tick = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - start) / 1200));
      setV(Math.round(target * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, delayMs]);
  return v;
}

function Stat({ value, label }: { value: number | undefined; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-2xl font-bold tabular-nums text-bronze-300 sm:text-3xl">{value === undefined ? "—" : value.toLocaleString("en-US")}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-horde-300/80">{label}</span>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

const FEATURES: { icon: IconName; text: string }[] = [
  { icon: "zap", text: "Balanced & Speedrun routes" },
  { icon: "map", text: "Zone route maps" },
  { icon: "sword", text: "Class & role tips" },
  { icon: "loop", text: "In-game sync addon" },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [focus, setFocus] = useState<Faction | null>(null);
  const [stats, setStats] = useState<LandingStats | null>(null);
  const [entering, setEntering] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const profile = useActiveProfileSummary();
  const returning = profile && profile.id !== "guest" ? profile : null;

  useEffect(() => {
    let alive = true;
    loadLandingStats().then(
      (s) => alive && setStats(s),
      () => undefined,
    );
    return () => {
      alive = false;
      window.clearTimeout(timer.current);
    };
  }, []);

  const steps = useCountUp(stats?.steps, 700);
  const quests = useCountUp(stats?.quests, 800);
  const zones = useCountUp(stats?.zones, 900);

  const enterHorde = (e: MouseEvent<HTMLAnchorElement>, rect: DOMRect) => {
    e.preventDefault();
    if (entering) return;
    const go = () => {
      // The landing page scrolls on phones; open the dashboard at its top.
      window.scrollTo(0, 0);
      navigate(HORDE_HOME);
    };
    if (reducedMotion()) {
      go();
      return;
    }
    setEntering({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    timer.current = window.setTimeout(go, 700);
  };

  return (
    <div className="landing relative min-h-screen overflow-x-hidden text-ink">
      <FusionBackground focus={entering ? "horde" : focus} />
      <div className="landing-vignette pointer-events-none fixed inset-0" aria-hidden="true" />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
        <header className="text-center">
          <p className="landing-rise text-[11px] font-bold uppercase tracking-[0.22em] text-paleGold/80 sm:text-xs sm:tracking-[0.35em]" style={{ animationDelay: "0ms" }}>
            WoW Forever · Leveling routes 1–60
          </p>
          <h1 className="landing-title landing-reveal mt-3 font-display text-4xl font-extrabold tracking-wide sm:text-6xl" style={{ animationDelay: "120ms" }}>
            {SITE_NAME}
          </h1>
          <p className="landing-rise mt-3 text-base text-ink/80 sm:text-lg" style={{ animationDelay: "320ms" }}>
            Choose your faction.
          </p>
        </header>

        <section aria-label="Factions" className="mx-auto mt-8 grid w-full max-w-5xl flex-1 grid-cols-1 gap-6 sm:mt-12 md:grid-cols-2 md:gap-14">
          <FactionCard
            faction="horde"
            href={HORDE_HOME}
            label={returning ? `Horde: continue as ${returning.name}` : "Horde: enter the leveling guide"}
            describedBy="horde-desc"
            onActivate={enterHorde}
            onHover={setFocus}
            delayMs={450}
          >
            <span className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-done/50 bg-done/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7fd49a]">
                <span className="landing-live h-1.5 w-1.5 rounded-full bg-[#7fd49a]" aria-hidden="true" />
                Available now
              </span>
              {/* The whole card is a link, so the badge is plain text here; the footer links to About. */}
              <StatusBadge status={stats?.status} link={false} className="py-1" />
            </span>
            <span className="sigil-float mt-5 block">
              <HordeSigil className="h-32 w-32 drop-shadow-[0_10px_30px_rgba(155,44,44,0.65)] transition-transform duration-500 group-hover:scale-105 sm:h-40 sm:w-40" />
            </span>
            <span className="faction-name-horde mt-4 font-display text-4xl font-extrabold tracking-wider sm:text-5xl">Horde</span>
            <span id="horde-desc" className="mt-2 max-w-xs text-sm text-muted sm:text-base">
              Durotar, Mulgore and Tirisfal Glades all the way to level 60, with dungeons, class tips and route maps.
            </span>
            <span className="mt-6 grid w-full grid-cols-3 gap-2 border-y border-bronze-700/60 py-4">
              <Stat value={steps} label="Steps" />
              <Stat value={quests} label="Quests" />
              <Stat value={zones} label="Zones" />
            </span>
            <span className="mt-auto flex w-full flex-col items-center gap-2 pt-6">
              <span className="faction-cta inline-flex min-h-touch items-center gap-2 rounded-md px-6 py-2.5 font-display text-base font-bold tracking-wider text-ink">
                {returning ? (
                  <>
                    Continue as {returning.name}
                    {returning.level ? <span className="font-sans text-sm font-semibold text-bronze-300">· Lv {returning.level}</span> : null}
                  </>
                ) : (
                  "Enter"
                )}
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </span>
            </span>
          </FactionCard>

          <FactionCard faction="alliance" label="Alliance: coming soon" describedBy="alliance-desc" onHover={setFocus} delayMs={600}>
            <span className="inline-flex items-center gap-2 rounded-full border border-silver-500/50 bg-alliance-700/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-silver-300">
              <LockIcon className="h-3 w-3" />
              Coming soon
            </span>
            <span className="sigil-float mt-5 block" style={{ animationDelay: "-3s" }}>
              <AllianceSigil className="h-32 w-32 opacity-80 drop-shadow-[0_10px_30px_rgba(31,78,156,0.7)] saturate-[0.7] transition duration-500 group-hover:opacity-100 group-hover:saturate-100 sm:h-40 sm:w-40" />
            </span>
            <span className="faction-name-alliance mt-4 font-display text-4xl font-extrabold tracking-wider sm:text-5xl">Alliance</span>
            <span id="alliance-desc" className="mt-2 max-w-xs text-sm text-silver-400 sm:text-base">
              Alliance routes from 1 to 60 are in the works. The Horde guide comes first.
            </span>
            <span className="mt-6 grid w-full grid-cols-3 gap-2 border-y border-silver-700/60 py-4 text-silver-500" aria-hidden="true">
              {["Steps", "Quests", "Zones"].map((l) => (
                <span key={l} className="flex flex-col items-center">
                  <span className="font-display text-2xl font-bold sm:text-3xl">?</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-alliance-300/70">{l}</span>
                </span>
              ))}
            </span>
            <span className="mt-auto flex w-full flex-col items-center gap-2 pt-6">
              <span className="inline-flex min-h-touch items-center gap-2 rounded-md border border-silver-700 bg-alliance-900/60 px-6 py-2.5 font-display text-base font-bold tracking-wider text-silver-500">
                <LockIcon className="h-4 w-4" />
                Locked
              </span>
            </span>
            <span className="alliance-seal" aria-hidden="true">
              <span>Coming soon</span>
            </span>
          </FactionCard>
        </section>

        <ul aria-label="Features" className="landing-rise mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2 sm:gap-3" style={{ animationDelay: "850ms" }}>
          {FEATURES.map((f) => (
            <li key={f.text} className="landing-chip inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-ink/85 sm:text-sm">
              <Icon name={f.icon} className="h-3.5 w-3.5 text-paleGold" />
              {f.text}
            </li>
          ))}
        </ul>

        <footer className="landing-rise mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs text-ink/55" style={{ animationDelay: "950ms" }}>
          <p>Free and fan-made. Not affiliated with or endorsed by Blizzard Entertainment.</p>
          <nav aria-label="Site" className="flex flex-wrap items-center justify-center gap-x-4">
            <Link to="/about" className="link-grow inline-flex min-h-touch items-center hover:text-ink">
              About
            </Link>
            <Link to="/credits" className="link-grow inline-flex min-h-touch items-center hover:text-ink">
              Credits
            </Link>
            <Link to="/addons" className="link-grow inline-flex min-h-touch items-center hover:text-ink">
              Addons
            </Link>
            <Link to={EXPERIMENTAL_HREF} className="link-grow inline-flex min-h-touch items-center hover:text-ink">
              Experimental
            </Link>
          </nav>
        </footer>
      </main>

      {entering && (
        <div
          className="landing-enter pointer-events-none fixed inset-0 z-50"
          style={{ "--ex": `${entering.x}px`, "--ey": `${entering.y}px` } as CSSProperties}
          aria-hidden="true"
        >
          <HordeSigil className="landing-enter-sigil absolute h-40 w-40" />
        </div>
      )}
    </div>
  );
}
