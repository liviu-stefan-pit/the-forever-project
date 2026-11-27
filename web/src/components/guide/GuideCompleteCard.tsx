import { Link } from "react-router";
import { HORDE_HOME } from "../../config";
import { formatExpectedLevel } from "../../lib/xp/checkpointText";
import { Icon } from "../ui/Icon";

export const GUIDE_COMPLETE_ID = "guide-complete";

export function GuideCompleteCard({
  nextSlug,
  nextName,
  expectedLevel,
}: {
  nextSlug?: string;
  nextName?: string;
  /** Exit expected level for this guide (last countable step's sim). Omit when unknown. */
  expectedLevel?: number;
}) {
  return (
    <section id={GUIDE_COMPLETE_ID} className="wow-frame panel-animate border-bronze-500/40 bg-bronze-900/25 p-5 text-center">
      <h2 className="font-display text-xl font-bold text-bronze-400">Guide complete</h2>
      <p className="mt-1 text-sm text-bronze-300/80">Lok&apos;tar ogar!</p>
      {expectedLevel != null && (
        <p className="mt-2 text-sm text-bronze-300/70">
          You finish this guide around level <span className="font-semibold text-ink">{formatExpectedLevel(expectedLevel)}</span>
        </p>
      )}
      {nextSlug ? (
        <Link
          to={`/guide/${nextSlug}`}
          className="press mt-4 inline-flex min-h-touch items-center gap-2 rounded-sm border border-bronze-500 bg-horde-500 px-5 py-3 font-semibold text-ink shadow-lg shadow-horde-700/40 hover:bg-horde-400"
        >
          Continue to {nextName ?? nextSlug} <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      ) : (
        <Link to={HORDE_HOME} className="mt-4 inline-flex min-h-touch items-center gap-2 text-sm font-semibold text-bronze-400 hover:text-bronze-300">
          Back to route
        </Link>
      )}
    </section>
  );
}
