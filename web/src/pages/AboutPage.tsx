/**
 * `/about`: what the site is, its experimental and play-tested status, use of AI, privacy, licence, disclaimer and
 * contact. Each section has an id (`/about#privacy`) so other pages can link straight to it.
 */
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Icon } from "../components/ui/Icon";
import { CONTACT_EMAIL, ISSUES_URL, LICENSE_URL, MAINTAINER_NAME, PRIVACY_URL, REPO_URL, SECURITY_URL, SITE_NAME } from "../config";

export const ABOUT_SECTIONS = [
  { id: "about", title: "About" },
  { id: "experimental", title: "Experimental" },
  { id: "play-tested", title: "Play-tested" },
  { id: "ai", title: "Use of AI" },
  { id: "privacy", title: "Privacy" },
  { id: "license", title: "License" },
  { id: "disclaimer", title: "Disclaimer" },
  { id: "contact", title: "Contact" },
] as const;

type SectionId = (typeof ABOUT_SECTIONS)[number]["id"];

const BLIZZARD_LEGAL_FAQ_URL = "https://www.blizzard.com/en-us/legal/c1ae32ac-7ff9-4ac3-a03b-fc04b8697010/blizzard-legal-faq";

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-bronze-400 hover:text-bronze-300">
      {children}
      <Icon name="external" className="h-3 w-3 shrink-0" />
    </a>
  );
}

function Section({ id, children }: { id: SectionId; children: ReactNode }) {
  const title = ABOUT_SECTIONS.find((s) => s.id === id)?.title ?? id;
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="wow-frame panel-animate scroll-mt-20 space-y-3 p-5">
      <h2 id={`${id}-heading`} className="font-display text-xl font-bold text-bronze-400">
        <a href={`#${id}`} className="hover:text-bronze-300">
          {title}
        </a>
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-ink">{children}</div>
    </section>
  );
}

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <header className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-bronze-400">About &amp; legal</p>
        <h1 className="font-display text-3xl font-bold text-bronze-400">{SITE_NAME}</h1>
        <nav aria-label="On this page" className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {ABOUT_SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="inline-flex min-h-touch items-center text-bronze-400 hover:text-bronze-300">
              {s.title}
            </a>
          ))}
        </nav>
      </header>

      <Section id="about">
        <p>
          {SITE_NAME} is a free, fan-made leveling guide for WoW Forever. It has Horde routes from level 1 to 60 in two paces, Balanced and
          Speedrun, with zone maps, quest details and class tips. Your progress is ticked off as you go, by hand or from the optional{" "}
          <Link to="/addons" className="text-bronze-400 hover:text-bronze-300">
            GuideWebExport addon
          </Link>
          . Alliance routes are planned.
        </p>
      </Section>

      <Section id="experimental">
        <p>
          <strong className="text-warn">Experimental.</strong> Routes marked Experimental have not been play-tested yet. Expect mistakes: a quest in the
          wrong order, a wrong coordinate, a step that does not fit your level. If you find one, please{" "}
          <Ext href={ISSUES_URL}>report it on GitHub</Ext>; it helps everyone who levels after you.
        </p>
        <p>
          The addons are experimental too. Testers who want to help improve the routes can record a run with{" "}
          <Link to="/addons" className="text-bronze-400 hover:text-bronze-300">
            AdventureLog
          </Link>
          .
        </p>
      </Section>

      <Section id="play-tested">
        <p>
          <strong className="text-done">Play-tested.</strong> A route marked Play-tested was played through in the live game with{" "}
          <Link to="/addons" className="text-bronze-400 hover:text-bronze-300">
            AdventureLog
          </Link>{" "}
          recording the run. Its quest order, quest locations and XP were checked against that log. The guide header says which class played it
          and over which levels.
        </p>
        <p>
          One run covers one class. Class quests for other classes are still unconfirmed, and so is any quest the run did not see. Those steps
          carry a small <strong className="font-semibold">Unconfirmed</strong> label. Pages that cover several routes, like the dashboard,
          stay Experimental until every route in them is play-tested.
        </p>
      </Section>

      <Section id="ai">
        <p>
          {SITE_NAME} is built and maintained with substantial help from AI. AI coding assistants (Anthropic&apos;s Claude, through Claude Code)
          write and refactor much of the code, research quest facts from the public sources listed on the{" "}
          <Link to="/credits" className="text-bronze-400 hover:text-bronze-300">
            Credits
          </Link>{" "}
          page, draft route steps and tips, and review changes. Notes in the source repository refer to the AI agents by code names (Nova,
          Lyra, Orion, Sentinel, Vulkan, Godfather).
        </p>
        <p>
          A human maintainer directs the work and reviews every change before it is published. Facts are cross-checked against QuestieDB and
          cited sources, but AI can make mistakes — if something is wrong, please <Ext href={ISSUES_URL}>report it</Ext>.
        </p>
      </Section>

      <Section id="privacy">
        <p>
          There are no accounts and no server-side database. Your characters, ticks and settings are stored only in your browser
          (localStorage) on this device; clearing site data removes them, and Export/Import on the{" "}
          <Link to="/profile" className="text-bronze-400 hover:text-bronze-300">
            Profile
          </Link>{" "}
          page moves them. Files you upload (such as GuideWebExport.lua) are read in your browser and never sent anywhere.
        </p>
        <p>
          The site is hosted on Cloudflare Pages, which processes standard request data (such as IP address) to deliver and protect the site.
          If visitor statistics are enabled they use Cloudflare Web Analytics, which sets no cookies. Fonts are served from this site.
        </p>
        <p>Links to Wowhead, GitHub and other sites take you to third-party services with their own privacy policies.</p>
        <p>
          {SITE_NAME} is run by {MAINTAINER_NAME}, who is responsible for the personal data described here. For privacy questions, or to
          use your rights (access, correction, deletion), email <a href={`mailto:${CONTACT_EMAIL}`} className="text-bronze-400 hover:text-bronze-300">{CONTACT_EMAIL}</a>.
          AdventureLog zips you choose to email there are used only to improve the routes and deleted within 12 months. Read the full{" "}
          <Ext href={PRIVACY_URL}>privacy notice</Ext>.
        </p>
      </Section>

      <Section id="license">
        <p>
          The code, the route text and the addons are free software under the GNU General Public License, version 3 or later
          (GPL-3.0-or-later). Data derived from Questie and QuestieDB is GPL-3.0, under Questie&apos;s terms. The fonts, Cinzel and Source
          Sans 3, are under the SIL Open Font License 1.1.
        </p>
        <p>
          Read the full <Ext href={LICENSE_URL}>LICENSE</Ext> and the <Ext href={REPO_URL}>source code on GitHub</Ext>. Every data source and
          its licence is listed on the{" "}
          <Link to="/credits" className="text-bronze-400 hover:text-bronze-300">
            Credits
          </Link>{" "}
          page.
        </p>
      </Section>

      <Section id="disclaimer">
        <p>
          {SITE_NAME} is a free, fan-made, non-commercial project. It is not affiliated with, endorsed, sponsored or approved by Blizzard
          Entertainment, Inc. World of Warcraft, Warcraft and Blizzard Entertainment are trademarks or registered trademarks of Blizzard
          Entertainment, Inc. in the U.S. and/or other countries.
        </p>
        <p>
          Game names, map images and other game content are © Blizzard Entertainment, Inc. They are used for this free, non-commercial
          fan project within the limits Blizzard sets for fan sites (see the <Ext href={BLIZZARD_LEGAL_FAQ_URL}>Blizzard Legal FAQ</Ext>), and
          will be removed if Blizzard asks.
        </p>
        <p>
          The guides, the site and the addons are provided as is, without warranty of any kind, and you use them at your own risk. Follow
          Blizzard&apos;s terms of use when you play; the project is not responsible for anything that happens to your game account,
          characters or files.
        </p>
      </Section>

      <Section id="contact">
        <p>
          Bugs, wrong steps and ideas: <Ext href={ISSUES_URL}>GitHub Issues</Ext>.
        </p>
        <p>
          Privacy, takedown requests and anything you would rather not post in public:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-bronze-400 hover:text-bronze-300">{CONTACT_EMAIL}</a>.
        </p>
        <p>
          Security problems: please report them privately with <strong>Report a vulnerability</strong> on the repository&apos;s{" "}
          <Ext href={SECURITY_URL}>Security tab</Ext>, not in a public issue.
        </p>
      </Section>
    </div>
  );
}
