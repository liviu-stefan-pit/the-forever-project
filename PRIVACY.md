# Privacy

_Last updated: 25 November 2026_

## Who is responsible

The Forever Project is run by its maintainer, **Liviu-Stefan Petroaia**, who is the controller for the little
personal data described here (EU General Data Protection Regulation, GDPR). Contact for anything about privacy,
including the rights below: **liviustefan.petroaia@gmail.com**.

The project has no accounts, no ads, no tracking cookies, and does not sell or share personal data.

## The website

There are no accounts and no server-side database. Your characters, ticks and settings are stored only in
your browser (localStorage) on this device; clearing site data removes them, and Export/Import on the
Profile page moves them. Files you upload (such as GuideWebExport.lua) are read in your browser and never
sent anywhere. The site asks the browser to keep this storage persistent so it is not cleared automatically;
the browser decides (Firefox may ask you). This storage is needed for the features you use, so the site asks
for no cookie consent; the project never sees what is stored.

In desktop Chrome and Edge you can instead choose GuideWebExport.lua once for one-click Sync. The browser
then keeps a reference to that file in this site's IndexedDB and reads it locally when you sync; the file
itself is still never uploaded. **Forget** under Game sync removes the reference.

**Hosting.** The site is hosted on Cloudflare Pages. To deliver and protect the site, Cloudflare processes
standard request data such as your IP address, browser and the page requested, as the project's processor. The
legal basis is the project's legitimate interest in running a working, secure website (GDPR Art. 6(1)(f)).
Cloudflare may process this data outside the EU; it relies on the EU-US Data Privacy Framework and the EU's
standard contractual clauses. See [Cloudflare's privacy policy](https://www.cloudflare.com/privacypolicy/).
If visitor statistics are enabled they use Cloudflare Web Analytics, which sets no cookies and counts visits
without building a profile of you. Fonts, scripts and data are served from this site.

**Links.** Links to Wowhead, GitHub and other sites take you to third-party services with their own privacy
policies. Addon downloads come from GitHub Releases, under
[GitHub's privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
Anything you post in a GitHub issue is public.

## The addons

GuideWebExport and AdventureLog write only to WoW's SavedVariables / a local folder on your PC; nothing is
uploaded unless you upload it yourself.

- **GuideWebExport** reads game APIs and saves a snapshot of the character you are playing to
  `WTF\Account\<account>\SavedVariables\GuideWebExport.lua`: name, realm, character GUID, race, class,
  level and XP, completed quests and the quest log, skills and professions, gold, equipped gear, bags,
  reputation, known flight points, hearthstone location, known spells, durability, pet and current
  position, plus the game's map bounds. See [addon/GuideWebExport/README.md](addon/GuideWebExport/README.md).
  When you load it on the site, it is read in your browser only.
- **AdventureLog** keeps a diary of one character (where you go and when, quests, experience, loot, gold,
  kills, deaths, time) in its SavedVariables. Loot and money messages about other players are not kept. Its
  export script copies the diary into `World of Warcraft\_forever_\Adventures\<Character> - adventure\` and a
  zip next to it. See [addon/AdventureLog/README.md](addon/AdventureLog/README.md).

Sharing those files is always your choice.

## AdventureLog zips you email to the project

If you choose to email an AdventureLog zip to liviustefan.petroaia@gmail.com:

- **What:** the contents above (character name, realm, race, class, faction, positions and times, quests,
  loot, gold, kills, deaths), plus your email address and anything you write in the email.
- **Why:** only to check and improve the guide routes. The legal basis is your consent (GDPR Art. 6(1)(a)),
  given by sending the file. You can withdraw it at any time by asking for deletion.
- **Who sees it:** only the maintainer, who may use the AI coding assistants described in
  [AI_USAGE.md](AI_USAGE.md) (Anthropic's Claude) to compare a log with the routes. Your character name and realm are not published or added to the project;
  only route facts (for example, "quest 840 was turned in at these coordinates") are.
- **Where:** the email is stored by Google (Gmail), the maintainer's email provider.
- **How long:** deleted when the route work it was for is done, and at the latest 12 months after it arrives.

## Your rights

You can ask for access to, correction or deletion of personal data the project holds about you, ask for its
processing to be restricted, object to it, or ask for a copy in a portable format. Email
liviustefan.petroaia@gmail.com. For the website itself the project holds nothing about you; your browser
data is on your device and you can delete it yourself. You also have the right to complain to a data
protection authority, for example the one in the EU country where you live.

## Changes

If this notice changes, the new version is published here with a new date. The full history is in the
repository.
