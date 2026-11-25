/** `/addons`: download the in-game addons (GuideWebExport, AdventureLog) from GitHub Releases. */
import { useState, type ReactNode } from "react";
import { copyText } from "../lib/clipboard";
import { Link } from "react-router";
import { Icon } from "../components/ui/Icon";
import { ADVENTURELOG_ZIP_URL, GUIDEWEBEXPORT_ZIP_URL, RELEASES_URL } from "../config";

const CODE = "break-all rounded-sm border border-stroke bg-canvas/60 px-1 py-px font-mono text-xs text-bronze-300";

function Code({ children }: { children: ReactNode }) {
  return <code className={CODE}>{children}</code>;
}

function DownloadButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      className="press inline-flex min-h-touch items-center gap-2 rounded-sm border border-bronze-500 bg-horde-500 px-4 py-2 text-sm font-semibold text-ink shadow-lg shadow-horde-700/40 hover:bg-horde-400 focus-visible:outline-white"
    >
      <Icon name="download" className="h-4 w-4" />
      {children}
    </a>
  );
}

function Addon({ id, name, tag, children, download }: { id: string; name: string; tag: string; children: ReactNode; download: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="wow-frame panel-animate scroll-mt-20 space-y-4 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={`${id}-heading`} className="font-display text-xl font-bold text-bronze-400">
          {name}
        </h2>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{tag}</span>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-ink">{children}</div>
      <div className="flex flex-wrap items-center gap-3">{download}</div>
    </section>
  );
}

/** Phones only: the addons install on the gaming PC, so offer to send this page there instead. */
function PhoneNotice() {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const send = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Forever Project addons", url });
        return;
      }
    } catch {
      return; // share sheet dismissed
    }
    if (await copyText(url)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };
  return (
    <div className="hidden space-y-3 rounded-sm border border-bronze-500/50 bg-frame/70 p-4 text-sm text-ink touch:block" data-testid="addons-phone-notice">
      <p>
        <strong>These install on the PC you play on</strong>, not on your phone. Open this page on that PC to download them.
      </p>
      <button
        type="button"
        onClick={send}
        className="press inline-flex min-h-touch items-center gap-2 rounded-sm border border-bronze-500/60 bg-frame px-3 text-sm font-semibold text-ink"
      >
        <Icon name={copied ? "check" : "external"} className="h-4 w-4" />
        {copied ? "Link copied" : "Send this page to your PC"}
      </button>
    </div>
  );
}

export function AddonsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-bronze-400">Addons</h1>
        <p className="text-sm text-muted">
          Two small, optional addons for <strong className="text-ink">WoW Forever 1.60.x only</strong>. Like the routes, they are{" "}
          <Link to="/about#experimental" className="text-bronze-400 hover:text-bronze-300">
            experimental
          </Link>
          . Both are open source; the zips come from the project&apos;s GitHub Releases.
        </p>
      </header>

      <PhoneNotice />

      <Addon
        id="guidewebexport"
        name="GuideWebExport"
        tag="Recommended"
        download={<DownloadButton href={GUIDEWEBEXPORT_ZIP_URL}>Download GuideWebExport.zip</DownloadButton>}
      >
        <p>
          Exports your character&apos;s progress (completed quests, quest log, level, professions, gold, gear) so the site can tick the quests
          you have already done.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Unzip it so the file ends up at <Code>World of Warcraft\_forever_\Interface\AddOns\GuideWebExport\GuideWebExport.toc</Code>.
          </li>
          <li>
            In game, type <Code>/gwe</Code>, then <Code>/reload</Code>. WoW writes the export file only on <Code>/reload</Code> or logout.
          </li>
          <li>
            On the{" "}
            <Link to="/profile" className="text-bronze-400 hover:text-bronze-300">
              Profile
            </Link>{" "}
            page, choose <strong>Import GuideWebExport.lua</strong> and pick{" "}
            <Code>World of Warcraft\_forever_\WTF\Account\&lt;account&gt;\SavedVariables\GuideWebExport.lua</Code>. The file is read in your
            browser and never uploaded anywhere.
          </li>
        </ol>
      </Addon>

      <Addon
        id="adventurelog"
        name="AdventureLog"
        tag="Optional · for testers"
        download={<DownloadButton href={ADVENTURELOG_ZIP_URL}>Download AdventureLog.zip</DownloadButton>}
      >
        <p>
          For testers who want to help improve the routes. It keeps a diary of one character while you play: where you go, quests,
          experience, loot, kills, deaths and time. Everything stays on your PC.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Unzip it so the file ends up at <Code>World of Warcraft\_forever_\Interface\AddOns\AdventureLog\AdventureLog.toc</Code>, then{" "}
            <Code>/reload</Code>. <Code>/adv status</Code>, <Code>/adv pause</Code> and <Code>/adv resume</Code> control the recording.
          </li>
          <li>
            Close the game, then double-click <strong>Export Adventure.bat</strong> in the addon folder. It runs the <Code>export.ps1</Code>{" "}
            script next to it; both are plain text, so you can read them before you run them.
          </li>
          <li>
            The script writes <Code>World of Warcraft\_forever_\Adventures\&lt;Character&gt; - adventure\</Code> and a zip next to it. Send
            that zip only if you want to share your run.
          </li>
        </ol>
      </Addon>

      <p className="text-sm text-muted">
        Older builds and release notes:{" "}
        <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-bronze-400 hover:text-bronze-300">
          All versions <Icon name="external" className="h-3 w-3" />
        </a>
      </p>
    </div>
  );
}
