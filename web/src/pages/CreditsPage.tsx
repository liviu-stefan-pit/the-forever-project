/** `/credits`: every data source and its licence, generated from the root CREDITS.md (DESIGN.md §8). */
import { Link } from "react-router";
import { CREDITS, safeUrl } from "../lib/credits";
import { Icon } from "../components/ui/Icon";

const plain = (t: string) => t.replace(/`/g, "");

export function CreditsPage() {
  const { sources, notice } = CREDITS;
  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-bronze-400">Credits</h1>
        <p className="text-sm text-muted">
          The site is free, with every feature open to everyone. These are the sources we take facts, data or code from, and their licences.
        </p>
        <p className="text-sm text-muted">
          The site&apos;s own licence is on the{" "}
          <Link to="/about#license" className="text-bronze-400 hover:text-bronze-300">
            About page
          </Link>
          .
        </p>
      </header>
      {sources.length === 0 ? (
        <p className="wow-frame p-4 text-sm text-muted">The credits list is not available in this build.</p>
      ) : (
        <ul className="space-y-3">
          {sources.map((s, i) => {
            const href = safeUrl(s.url);
            return (
              <li key={`${s.name}-${i}`} className="wow-frame lift panel-animate space-y-2 p-4" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="min-w-0 break-words text-base font-semibold text-ink">{plain(s.name)}</h2>
                  {href && (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-touch min-w-0 max-w-full items-center gap-1 text-sm text-bronze-400 hover:text-bronze-300">
                      <span className="min-w-0 break-all">{href.replace(/^https?:\/\//, "")}</span> <Icon name="external" className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  )}
                </div>
                <dl className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-x-4 gap-y-1 text-sm sm:grid-cols-[7rem,minmax(0,1fr)]">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted sm:pt-0.5">Licence</dt>
                  <dd className="min-w-0 break-words text-ink">{plain(s.licence)}</dd>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted sm:pt-0.5">Used for</dt>
                  <dd className="min-w-0 break-words text-ink">{plain(s.usedFor)}</dd>
                  {s.files && (
                    <>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted sm:pt-0.5">Files</dt>
                      <dd className="min-w-0 break-all font-mono text-xs text-muted">{plain(s.files)}</dd>
                    </>
                  )}
                </dl>
              </li>
            );
          })}
        </ul>
      )}
      {notice && <p className="text-xs text-muted">{notice}</p>}
    </div>
  );
}
