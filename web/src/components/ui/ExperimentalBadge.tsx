/**
 * "Experimental" pill for guide headers, route cards and the landing page's Horde card.
 * Links to the About page's #experimental section; use `link={false}` inside another link
 * (the landing page's Horde card is one big anchor and anchors cannot nest).
 */
import { Link } from "react-router";
import { Icon } from "./Icon";

export const EXPERIMENTAL_TEXT = "Experimental — these routes have not been fully play-tested yet. Expect mistakes and please report them.";
export const EXPERIMENTAL_HREF = "/about#experimental";

const PILL =
  "inline-flex shrink-0 items-center gap-1 rounded-full border border-warn/50 bg-warn/10 px-2 py-px text-[10px] font-bold uppercase tracking-[0.18em] text-warn";

export function ExperimentalBadge({ link = true, className = "" }: { link?: boolean; className?: string }) {
  const body = (
    <>
      <Icon name="alert" className="h-3 w-3" />
      Experimental
    </>
  );
  if (!link) {
    return (
      <span className={`${PILL} ${className}`} title={EXPERIMENTAL_TEXT}>
        {body}
      </span>
    );
  }
  return (
    <Link
      to={EXPERIMENTAL_HREF}
      title={EXPERIMENTAL_TEXT}
      aria-label={`${EXPERIMENTAL_TEXT} Read more on the About page.`}
      className={`${PILL} transition hover:border-warn hover:bg-warn/20 ${className}`}
    >
      {body}
    </Link>
  );
}
