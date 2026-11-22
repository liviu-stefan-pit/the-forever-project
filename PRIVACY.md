# Privacy

## The website

There are no accounts and no server-side database. Your characters, ticks and settings are stored only in
your browser (localStorage) on this device; clearing site data removes them, and Export/Import on the
Profile page moves them. Files you upload (such as GuideWebExport.lua) are read in your browser and never
sent anywhere. The site asks the browser to keep this storage persistent so it is not cleared automatically;
the browser decides (Firefox may ask you).

In desktop Chrome and Edge you can instead choose GuideWebExport.lua once for one-click Sync. The browser
then keeps a reference to that file in this site's IndexedDB and reads it locally when you sync; the file
itself is still never uploaded. **Forget** under Game sync removes the reference.

The site is hosted on Cloudflare Pages, which processes standard request data (such as IP address) to
deliver and protect the site. If visitor statistics are enabled they use Cloudflare Web Analytics, which
sets no cookies. Fonts are served from this site. Links to Wowhead, GitHub and other sites take you to
third-party services with their own privacy policies.

## The addons

GuideWebExport and AdventureLog write only to WoW's SavedVariables / a local folder on your PC; nothing is
uploaded unless you upload it yourself.

- **GuideWebExport** reads game APIs and saves a snapshot of the character you are playing to
  `WTF\Account\<account>\SavedVariables\GuideWebExport.lua`: name, realm, character GUID, race, class,
  level and XP, completed quests and the quest log, skills and professions, gold, equipped gear, bags,
  reputation, known flight points, hearthstone location, known spells, durability, pet and current
  position, plus the game's map bounds. See [addon/GuideWebExport/README.md](addon/GuideWebExport/README.md).
- **AdventureLog** keeps a diary of one character (where you go, quests, experience, loot, kills, deaths,
  time) in its SavedVariables. Its export script copies that into
  `World of Warcraft\_forever_\Adventures\<Character> - adventure\` and a zip next to it. See
  [addon/AdventureLog/README.md](addon/AdventureLog/README.md).

Sharing those files is always your choice.

## Questions

Open an issue at https://github.com/liviu-stefan-pit/the-forever-project/issues.
