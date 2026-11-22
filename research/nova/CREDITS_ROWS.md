Rows for CREDITS.md (between `<!-- sources:start -->` and `<!-- sources:end -->`), format from `sentinel/credits` 2b3fab5:

| Name | URL | Licence | Used for | Files |
|---|---|---|---|---|
| QuestieDB, Forever data (quest database) | https://github.com/Questie/QuestieDB/tree/master/data/Forever | GPL-3.0 (Questie project; copied under GPLv3 terms). The Questie name and logo are not used. | Quest ids, chains, givers/turn-ins, NPC/object ids, spawn coordinates, item drop sources, vendor recipe lists for Horde 1-20 | research/nova/catalog/quests_horde_1_24.json, research/nova/catalog/npcs_named.json; coordinates in research/nova/zones/*.json |
| WoW Forever DB | https://wowfdb.com/zones/durotar/ | Facts checked by hand, no text copied | Which quests are new or changed in Forever; zone and enemy levels | research/nova/zones/*.json (forever: true steps) |
| Hardcore Helper, WoW Forever zone guides | https://www.hardcorehelper.com/forever/guides/durotar-leveling-guide | Facts checked by hand, no text copied | Names, givers and objectives of Forever-only quests in Durotar, Mulgore, Tirisfal | research/nova/zones/*.json |
| Hackverso, WoW Forever leveling | https://hackverso.com/en/wowforever/leveling/ | Facts checked by hand, no text copied | Forever-only city and Barrens quests (Exploring the Horde, Rocks to Rests, Chol'aruk) | research/nova/zones/*.json |
| WoW Forever Guides, the Barrens | https://wowforeverguides.com/zones/the-barrens | Facts checked by hand, no text copied | Forever-only Barrens quests (Parts and Pieces, WANTED: Bruuz, Chol'aruk, Wrongly Blamed) | research/nova/zones/barrens-12-20.json |
| Wowhead Classic | https://www.wowhead.com/classic/ | Facts checked by hand only; links per quest/NPC/item, no scraping | Reference link on every step | research/nova/zones/*.json |
| WarcraftMaps, Classic vs Forever professions | https://warcraftmaps.com/guides/classic-vs-forever-professions | Facts checked by hand, no text copied | Forever profession rule changes in step tips | research/nova/v2/*.json |
| Method.gg, Waylaid Crates and Merchant's Favor | https://www.method.gg/wow-forever/how-to-get-waylaid-crates-and-merchants-favor-in-wow-forever | Facts checked by hand, no text copied | Dokimi location, crate turn-in, Shipping Label bonus | research/nova/v2/barrens-12-20.json |
| classic-wow.com Forever NPC database | https://www.classic-wow.com/database/npc/256386/dokimi | Facts checked by hand, no text copied | Dokimi npc id and coordinates | research/nova/v2/barrens-12-20.json |
