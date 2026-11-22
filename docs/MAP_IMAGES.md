# Zone map images (wow.export → `web/public/maps/<uiMapId>.webp`)

The site draws each zone section on the real in-game zone map (D7). The images come from your own
game files. They are never downloaded from a website. Until you do this step, the site uses its
stylised grid fallback.

## What the pipeline needs

For each zone below, export the 12 tiles `<folder>1.blp` … `<folder>12.blp` from
`interface/worldmap/<folder>/` as **PNG**. Each tile is 256 × 256. They form a 4 × 3 grid, and
the visible map is the top-left 1002 × 668 area. `map_images.py --images` stitches the tiles, crops the
map and writes `web/public/maps/<uiMapId>.webp` (WebP quality 85).

Other files in those folders are explored-area overlays (e.g. `razorhill.blp`). They are not
needed, and the script ignores them.

Folder names are the **vanilla internal names**. Several are misspelt in the game data
(`hilsbrad`, `ogrimmar`, `aszhara`). If your export uses a later spelling, the script also tries the
aliases listed.

### Zone list

Every vanilla zone in `pipeline/maps/zones_static.py` (continent maps excluded). Export the zones you
care about; zones without an image use the grid fallback. To print the uiMap ids and folder names
(with accepted aliases):

```
python -I pipeline/map_images.py --list
```

## Which game data to open

Your install at `C:\Program Files (x86)\World of Warcraft\` is a Blizzard **CASC** install. Its
`.build.info` currently lists a single active product, **`wowf`** (WoW Forever, folder
`_forever_`, build 1.60.1.70959). The `_classic_era_` folder holds only `Interface`/`Fonts`
leftovers and no game client, so there is no local Classic Era data to open.

- **Route A (preferred, fully local):** open the local install in wow.export and pick the Forever
  build if it is offered.
- **Route B (if wow.export doesn't offer or open `wowf`):** use wow.export's *Blizzard CDN* mode and
  pick **Classic Era** (`wow_classic_era`). This fetches game files from Blizzard's own content
  servers, as the launcher does. The vanilla zone map art is the same as Forever's for every zone in
  the list above.

Reading CASC directly from this pipeline was considered and rejected: it needs the encoding and
root manifests, a listfile, BLP decoding and keyed archives. That is a project in itself, and
wow.export already does it.

## Step by step

1. **Get wow.export yourself** from its official GitHub releases page
   (`github.com/Kruithne/wow.export` → *Releases*). Download the Windows build, unzip it to a folder
   of your choice and start `wow.export.exe`. The pipeline never downloads it for you.
2. On the start screen choose **Open Local Installation** and select
   `C:\Program Files (x86)\World of Warcraft`. Pick the WoW Forever / `wowf` build from the list.
   If no usable build appears, or loading fails, go back and use the **Blizzard CDN** option with
   region **EU** and the **Classic Era** product (Route B).
3. Open **Settings**. Set the **export directory** to an empty folder, e.g.
   `C:\wow-maps\map_export`, and set the texture export format to **PNG** (the
   default). Exporting the raw `.blp` also works, because Pillow reads BLP.
4. Go to the **Textures** tab and type `interface/worldmap/durotar/` in the filter box. Select
   `durotar1.blp` … `durotar12.blp` (Shift+click) and click **Export Selected**. Repeat for every
   folder in the table. Optional shortcut: if *regular-expression filtering* is enabled in
   wow.export's settings, this one filter lists all main-zone tiles at once:

   ```
   ^interface/worldmap/(durotar|barrens|ogrimmar|tirisfal|undercity|silverpine|moonglade|mulgore|thunderbluff|stonetalonmountains|ashenvale|hilsbrad|stranglethorn|dustwallow|thousandneedles|feralas|tanaris|alterac|arathi|desolace|badlands|swampofsorrows|blastedlands|hinterlands|ungorocrater|searinggorge|burningsteppes|aszhara|felwood|winterspring|westernplaguelands|easternplaguelands|silithus)/\1\d+\.blp$
   ```

   Add `|westfall|dunmorogh|lochmodan|wetlands|duskwood` inside the brackets for the minor zones.
   Select all results and export.
5. wow.export keeps the game path, so you end up with
   `map_export\interface\worldmap\durotar\durotar1.png` and so on. Upper or lower case doesn't
   matter.
6. Build the images:

   ```
   cd <path-to>\project-forever
   python -I pipeline/map_images.py --images <path-to>\map_export --verbose
   ```

   The script searches the export folder recursively. It writes `web/public/maps/<uiMapId>.webp`
   (roughly 100–200 KB each). With `--verbose` it prints, per zone, the tiles used or that none were
   found.

## Notes

- Tiles of 512 px (HD texture packs) are scaled down to the 256 px grid automatically.
- Missing tiles are filled with the site's dark background and listed in the report.
- Deadwind Pass (1430) and the continent maps are not in the list. The route only crosses
  Deadwind Pass, and its few points are drawn on the neighbouring zone's map.

## Already-stitched zone maps

If you have whole zone maps instead of tiles, named `Zone_<areaId>_<Name>_<Folder>.png` (1002 × 668, e.g.
`Zone_14_Durotar_Durotar.png`), convert them in one step:

```
python -I pipeline/map_images.py --zones <folder with Zone_*.png>
```

The area id is looked up in `content/questie-db/zones.json` (this covers the Forever zones such as Riverglades,
Zephras Isle, Shen'dralas and Mount Hyjal); the folder name is the fallback. Then run `npm run data` in `web/`
so `zones.json` points each zone at its image.

## Publishing

`web/public/maps/` is committed, so generated images ship with the site. They are Blizzard game art, used under
Blizzard's Fan Content Policy and not covered by the project's GPL licence (see `NOTICE.md`). Commit only the
stitched `<uiMapId>.webp` files, never raw exports.
