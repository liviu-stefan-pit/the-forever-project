/** Site footer (DESIGN.md §8): fan-made notice, About · Credits · Addons · source, optional coffee text link. */
import { Link } from "react-router";
import { COFFEE_URL, REPO_URL } from "../../config";
import { safeUrl } from "../../lib/credits";

function CupIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 2v2M10 2v2M14 2v2" />
    </svg>
  );
}

export function Footer({ coffeeUrl = COFFEE_URL }: { coffeeUrl?: string }) {
  const coffee = safeUrl(coffeeUrl);
  return (
    <footer className="border-t border-stroke/60 px-4 py-5 text-xs text-muted sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2">
        <p className="min-w-0 flex-1">Free and fan-made. Not affiliated with Blizzard Entertainment or WoW Forever.</p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-4">
          <Link to="/" className="link-grow inline-flex min-h-touch items-center hover:text-ink">
            Home
          </Link>
          <Link to="/about" className="link-grow inline-flex min-h-touch items-center hover:text-ink">
            About
          </Link>
          <Link to="/credits" className="link-grow inline-flex min-h-touch items-center hover:text-ink">
            Credits
          </Link>
          <Link to="/addons" className="link-grow inline-flex min-h-touch items-center hover:text-ink">
            Addons
          </Link>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="link-grow inline-flex min-h-touch items-center hover:text-ink">
            Source on GitHub
          </a>
          {coffee && (
            <a href={coffee} target="_blank" rel="noopener noreferrer" className="link-grow inline-flex min-h-touch items-center gap-1 hover:text-ink">
              <CupIcon className="h-3.5 w-3.5" /> Buy me a coffee
            </a>
          )}
        </nav>
      </div>
    </footer>
  );
}
