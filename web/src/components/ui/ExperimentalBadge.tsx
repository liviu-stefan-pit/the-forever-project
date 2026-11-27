/**
 * Route status pills for guide headers, route cards and the landing page's Horde card.
 * `ExperimentalBadge` (amber) links to the About page's #experimental section; `PlaytestedBadge` (green)
 * links to #play-tested. `StatusBadge` picks one from a pack status (see `lib/packStatus.ts`).
 * Use `link={false}` inside another link (the landing page's Horde card is one big anchor and anchors cannot nest).
 */
import { Link } from "react-router";
import type { GuidePlaytest, GuideStatus } from "../../data/schema";
import { Icon } from "./Icon";

export const EXPERIMENTAL_TEXT = "Experimental — these routes have not been fully play-tested yet. Expect mistakes and please report them.";
export const EXPERIMENTAL_HREF = "/about#experimental";
export const PLAYTESTED_HREF = "/about#play-tested";

export const PLAYTESTED_LABEL = "Tested in game";

/** Tooltip for the green badge. The run's details stay in the data; the badge only says the route was played. */
export function playtestedText(_p?: GuidePlaytest): string {
  return "Tested in game — we played this route in the game and checked it.";
}

const PILL = "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-px text-[10px] font-bold uppercase tracking-[0.18em]";
const TONE = {
  warn: { base: "border-warn/50 bg-warn/10 text-warn", hover: "hover:border-warn hover:bg-warn/20" },
  done: { base: "border-done/50 bg-done/10 text-done", hover: "hover:border-done hover:bg-done/20" },
} as const;

function Pill({
  tone,
  icon,
  label,
  text,
  href,
  link,
  className,
  testId,
}: {
  tone: keyof typeof TONE;
  icon: "alert" | "check";
  label: string;
  text: string;
  href: string;
  link: boolean;
  className: string;
  testId: string;
}) {
  const body = (
    <>
      <Icon name={icon} className="h-3 w-3" />
      {label}
    </>
  );
  if (!link) {
    return (
      <span className={`${PILL} ${TONE[tone].base} ${className}`} title={text} data-testid={testId}>
        {body}
      </span>
    );
  }
  return (
    <Link
      to={href}
      title={text}
      aria-label={`${text} Read more on the About page.`}
      data-testid={testId}
      className={`${PILL} ${TONE[tone].base} transition ${TONE[tone].hover} ${className}`}
    >
      {body}
    </Link>
  );
}

export function ExperimentalBadge({ link = true, className = "" }: { link?: boolean; className?: string }) {
  return <Pill tone="warn" icon="alert" label="Experimental" text={EXPERIMENTAL_TEXT} href={EXPERIMENTAL_HREF} link={link} className={className} testId="badge-experimental" />;
}

export function PlaytestedBadge({ playtested, link = true, className = "" }: { playtested?: GuidePlaytest; link?: boolean; className?: string }) {
  return <Pill tone="done" icon="check" label={PLAYTESTED_LABEL} text={playtestedText(playtested)} href={PLAYTESTED_HREF} link={link} className={className} testId="badge-playtested" />;
}

/** Green when the status is `play-tested`, amber otherwise (missing status = experimental). */
export function StatusBadge({
  status,
  playtested,
  link = true,
  className = "",
}: {
  status?: GuideStatus;
  playtested?: GuidePlaytest;
  link?: boolean;
  className?: string;
}) {
  return status === "play-tested" ? (
    <PlaytestedBadge playtested={playtested} link={link} className={className} />
  ) : (
    <ExperimentalBadge link={link} className={className} />
  );
}
