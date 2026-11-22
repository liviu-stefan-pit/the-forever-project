BZ="https://news.blizzard.com/en-us/article/24301455/explore-the-new-dungeons-of-world-of-warcraft-forever"
def Q(name,giver=None,giverZone=None,x=None,y=None,minLevel=None,questLevel=None,objective=None,prereqs=None,turnIn=None,rewards=None,questId=None,sources=None,note=None):
    return {"id":questId,"name":name,"minLevel":minLevel,"questLevel":questLevel,"giver":{"name":giver,"zone":giverZone,"x":x,"y":y} if giver else None,
            "objectiveSummary":objective,"prerequisitesByName":prereqs or [],"turnIn":turnIn,"rewardsByName":rewards or [],
            "sources":sources or [],"verified":False,"verificationNotes":["From fan/news sites only; not in QuestieDB (Classic-era) and not cross-checked in game."]+([note] if note else [])}
GG="https://gamer-guides.com/warcraft-forever/ruins-of-lordaeron-quests/"; WT="https://www.warcrafttavern.com/forever/guides/the-ruins-of-lordaeron-quests/"
DR="https://dailyrespawn.com/article/how-to-get-the-dalaran-sewer-key-in-wow-forever-city-of-dalaran-attunement-quest"; WS="https://wowseer.gg/guides/dalaran-attunement"; WTD="https://www.warcrafttavern.com/forever/guides/city-of-dalaran-quests/"
OL="https://outputlag.com/guides/wow-forever-drowned-city-dungeon-guide/"; HH="https://www.hardcorehelper.com/forever/guides/drowned-city-dungeon-guide"
MB="https://mobalytics.gg/wow-forever/dungeons/excavation-site-wetlands-quests"; GS="https://www.gamespot.com/articles/wow-forever-excavation-site-wetlands-dungeon-guide-quests-bosses-and-loot/"; WIKI_EX="https://warcraft.wiki.gg/wiki/Excavation_Site:_Wetlands"
KT="https://www.warcrafttavern.com/forever/guides/kroldok-stronghold/"; KM="https://mobalytics.gg/wow-forever/dungeons/kroldok-stronghold-dungeon-quests"
NEW=[
 dict(name="Ruins of Lordaeron",levelRange=[15,20],location="Ruins above the Undercity, Tirisfal Glades",entrance={"zone":"Undercity (reported)","x":66.0,"y":11.0,"source":GG,"verified":False},
  hordeAccess="Easy: from the Undercity.",quests=[
   Q("Light's Justice","Morbin Lightbane","Undercity (Royal Quarter)",57.8,89.7,15,None,"Collect 25 Intact Limbs from undead in the dungeon",turnIn="Morbin Lightbane",rewards=["The Stitcher","Spare Part Bindings"],sources=[WT,GG]),
   Q("The New Plague","Theodore Griffs","Undercity (Apothecarium)",46.5,71.6,16,None,"Loot the Highly Toxic Strain from Witherfang",prereqs=["A Recipe for Death chain (Apothecary Renferrel, The Sepulcher)"],turnIn="Theodore Griffs",rewards=["Plaguefang","Blight Gloves"],sources=[WT,GG]),
   Q("The Wrath of Rath'mael","Deathguard Kristof","Tirisfal Glades (camp SE of Brill)",65.2,60.1,15,None,"Kill Rath'mael",prereqs=["Breadcrumb from Deathguard Linnea (reported)"],turnIn="Deathguard Kristof",rewards=["Forsaken Greataxe","Gnarled Necromancer's Staff"],sources=[WT,GG]),
   Q("A Frightened Request","Tabitha Heartweaver","Silverpine Forest (The Sepulcher)",44.5,43.0,15,None,"Find Edward Heartweaver's body in the graveyard",turnIn="Tabitha Heartweaver",rewards=["Edwards' Knife","Tabitha's Cuffs"],sources=[WT,GG]),
   Q("Unending Torment","Abominable Head (item from The Baron)","Ruins of Lordaeron",None,None,16,None,"Five-part chain ending with Master Apothecary Faranell",turnIn="Master Apothecary Faranell (Undercity)",sources=[WT,GG]),
   Q("Crest of Lordaeron","Crest of Lordaeron (random spawn inside)","Ruins of Lordaeron",None,None,16,None,"Bring the crest out",turnIn="Oran Snakewrithe (Undercity 73.6, 32.6)",rewards=["Small Sack of Gems"],sources=[GG,WT]),
  ]),
 dict(name="City of Dalaran",levelRange=[28,33],location="Alterac Mountains",entrance={"zone":"Alterac Mountains","x":8.0,"y":61.0,"source":"https://warcraft.wiki.gg/wiki/City_of_Dalaran","verified":False},
  hordeAccess="Attunement: Dalaran Sewer Key from the Image of Archmage Modera after the Tarren Mill chain.",quests=[
   Q("Prison Break In","Magus Wordeen Voidglare","Hillsbrad Foothills (Tarren Mill)",61.5,20.9,30,33,"Recover four Bloodstone pieces at Lordamere Internment Camp",turnIn="Magus Wordeen Voidglare",sources=[BZ,WTD,"https://wowf.io/en/quests/544"]),
   Q("Key to the City","Magus Wordeen Voidglare","Hillsbrad Foothills (Tarren Mill)",61.5,20.9,30,33,"Loot the Grimy Key from the Warden's Footlocker",turnIn="Magus Wordeen Voidglare",sources=[BZ,WTD]),
   Q("Dalaran Patrols","Magus Wordeen Voidglare","Hillsbrad Foothills (Tarren Mill)",61.5,20.9,30,35,"Kill 6 Dalaran Summoners and 8 Elemental Slaves",prereqs=["Prison Break In","Key to the City"],sources=[WTD,DR]),
   Q("Blood in the Streets","Magus Wordeen Voidglare","Hillsbrad Foothills (Tarren Mill)",61.5,20.9,30,34,"Find the Image of Archmage Modera at the sewer gate (Silverpine 68.6, 45.2)",prereqs=["Dalaran Patrols"],turnIn="Image of Archmage Modera",sources=[WTD,WS]),
   Q("Heart of Disruption","Image of Archmage Modera","Silverpine Forest (Lordamere shore)",68.6,45.2,None,33,"Get the Arcane Mote from the Shade of the Archmage; grants the Dalaran Sewer Key",prereqs=["Blood in the Streets"],turnIn="Magus Wordeen Voidglare",rewards=["Battle Spaulders","Enchanted Sandals","Striking Staff"],sources=[WS,DR]),
   Q("Source of Power","Doctor Martin Felben","Undercity (Apothecarium)",None,None,None,None,"Collect 6 Cracked Sentry Cores from Fragmented Sentries",rewards=["Unstable Power Core","Construct Cloak"],sources=[WS,DR]),
   Q("The Grave Knight","Melisara","Hillsbrad Foothills (Tarren Mill)",None,None,None,None,"Kill Atrexis the Grave Knight",rewards=["Gravewalker Boots","Undead Knight's Bracers"],sources=[WS,DR]),
   Q("Opportunistic Education","Rexxie Copperclutch","City of Dalaran (inside entrance)",None,None,None,None,"Collect The Founding of Dalaran",sources=[WS,DR]),
  ]),
 dict(name="Excavation Site: Wetlands",levelRange=[24,29],location="Above Whelgar's Excavation, Wetlands",entrance={"zone":"Wetlands","x":53.4,"y":65.3,"source":WIKI_EX,"verified":False},
  hordeAccess="Long trek: Hillsbrad -> Arathi Highlands -> Thandol Span.",quests=[
   Q("Changing Tastes","Borstan","Orgrimmar (The Drag)",57.3,53.3,24,None,"Collect 4 Thicket Raptor Meat in Stalker's Thicket",turnIn="Borstan",rewards=["Satchel of Potions","Serrated Raptor Claw","Recipe: Twice-Spiced Raptor Slice"],sources=[MB,GS],note="Profession hook: Cooking recipe reward."),
   Q("Open the Maw","Deathstalker Agent","Wetlands (hill outside the dungeon)",51.4,59.2,24,None,"Kill 2 Dragonmaw Saboteurs, 4 Dragonmaw Warders; loot a Dragonmaw Dispatch",prereqs=["Dragonmaw Rumors (Zaruk, Hammerfall 74.4, 35.6)"],turnIn="Deathstalker Agent",rewards=["Knife-Polishing Rag","Dirt-Heavy Bracers"],sources=[MB,GS]),
   Q("Elder Knowledge","Titan Relic (item from Relic Guardian)","Excavation Site",None,None,24,None,"Bring the relic to Bashana Runetotem, Thunder Bluff (70.8, 33.7)",turnIn="Bashana Runetotem",sources=[MB,GS]),
   Q("Earthen Echo","Bashana Runetotem","Thunder Bluff (Elder Rise)",70.8,33.7,24,None,"Take the relic to Muln Earthfury, Skywatcher Plateau, Mulgore (33.4, 22.5)",prereqs=["Elder Knowledge"],turnIn="Muln Earthfury",rewards=["Heavehammer","Healer's Staff","Furs of the Earthen Ring"],sources=[GS,MB]),
  ]),
 dict(name="The Drowned City",levelRange=[35,40],location="Off the coast of Stranglethorn Vale, west of Grom'gol",entrance={"zone":"Stranglethorn Vale (underwater, reported)","x":21.0,"y":28.0,"source":HH,"verified":False},
  hordeAccess="Fly or zeppelin to Grom'gol, swim west and dive.",quests=[
   Q("The Drowned City","Kin'weelay","Stranglethorn Vale (Grom'gol)",32.2,27.8,30,40,"Make rubbings of the tablets inside with the given hide and charcoal",prereqs=["The Vile Reef","The Gurubashi Legends of Old","Locating the Lost City"],turnIn="Kin'weelay",sources=[OL,HH]),
   Q("The Only Good Brinescale...","Commander Aggro'gosh","Stranglethorn Vale (Grom'gol)",32.2,28.8,30,38,"Kill Var'Taka",prereqs=["Enemies in the Water","Locating the Lost City"],turnIn="Commander Aggro'gosh",rewards=["Tidesoaked Leggings","Naga Priestess's Mantle"],sources=[OL,HH]),
   Q("Ancient Gurubashi Idol","Mazu'kon","Mulgore (Skywatcher Plateau)",32.4,20.6,30,40,"Recover the idol from a troll priest inside",turnIn="Mazu'kon",sources=[OL,HH]),
   Q("Shady Saltseers","Krazek","Stranglethorn Vale (Booty Bay)",27.0,77.2,34,40,"Collect 10 Voodoo Infused Artifacts from Saltseer pirates",turnIn="Krazek",rewards=["Rusted Troll War Belt","Saltseer's Helm"],sources=[HH]),
   Q("The Saltseer Captain","Krazek","Stranglethorn Vale (Booty Bay)",27.0,77.2,34,40,"Kill 3 Saltseer Coroners and Captain Dreadrise",turnIn="Krazek",rewards=["Mutinous Cuffs","South Seas Shroud"],sources=[HH]),
  ]),
 dict(name="Krol'dok Stronghold",levelRange=[40,45],location="Riverglades",entrance={"zone":"Riverglades","x":37.5,"y":37.5,"source":KT,"verified":False},
  hordeAccess="Fly to Rog'mar; long Riverglades chain unlocks most quests.",quests=[
   Q("A Token of Vengeance","Da'grosh","Riverglades",33.4,38.0,40,None,"Collect 15 Cultist Ears inside",prereqs=["Bring Me His Head (wowhead forever quest 94768)"],sources=[KT,KM,"https://www.wowhead.com/forever/quest=94768/bring-me-his-head"]),
   Q("Eye of Mugg","Krom'rosh","Riverglades (Rog'mar)",59.5,45.8,40,None,"Kill Overlord Mugg and loot his eye",prereqs=["The Wayward Warrior chain (wowhead forever quest 94744)","It Is Time, Brother..."],rewards=["Rock on Stick","Stick No Rock","Bigger Rock on Bigger Stick"],sources=[KT,KM,"https://www.wowhead.com/forever/quest=94744/the-wayward-warrior"]),
   Q("Tome of Twilight","Tran'gul","Riverglades (Rog'mar)",59.5,44.0,40,None,"Kill Nar'gurk and loot the tome",prereqs=["It Is Time, Brother..."],rewards=["Indoctrinated Choker","Convert's Bindings"],sources=[KT,KM]),
   Q("Krol'dok Moulding / Key Ingredients","Krol'dok Moulding (item from Tunk)","Krol'dok Stronghold",None,None,40,None,"Bring the moulding plus 4 Thick Leather and 12 Iron Bars to Kreza Darkthorn",rewards=["Krol'dok Compound Key"],sources=[KM,KT],note="Profession hook: needs Thick Leather and Iron Bars."),
  ]),
 dict(name="Alcaz Prison",levelRange=[48,53],location="Alcaz Island, Dustwallow Marsh",entrance=None,hordeAccess="Breadcrumb from Eitrigg in Orgrimmar to Brackenwall Village.",quests=[
   Q("The Missing Kor'kron","Eitrigg","Orgrimmar",None,None,None,None,"Breadcrumb to Nazeer Bloodpike, Brackenwall Village (35.2, 30.7)",turnIn="Nazeer Bloodpike",questId=None,sources=["https://wowf.io/en/quests/95283","https://wowforevercompass.com/dungeons/alcaz-prison/"],note="wowf.io lists it under id 95283; not confirmed as the game quest id."),
   Q("The Elite of the Elite","Nazeer Bloodpike","Dustwallow Marsh (Brackenwall Village)",35.2,30.7,None,None,"Go to Sergeant Ulka on Alcaz Island",prereqs=["The Missing Kor'kron"],turnIn="Sergeant Ulka",sources=["https://wowforevercompass.com/dungeons/alcaz-prison/"]),
   Q("No Orc Left Behind","Sergeant Ulka","Dustwallow Marsh (Alcaz Island)",None,None,None,None,None,prereqs=["The Elite of the Elite"],sources=["https://wowforevercompass.com/dungeons/alcaz-prison/"]),
   Q("A Little Payback","Sergeant Ulka","Dustwallow Marsh (Alcaz Island)",None,None,None,None,None,prereqs=["The Elite of the Elite"],sources=["https://wowforevercompass.com/dungeons/alcaz-prison/"]),
   Q("Blood Red Bandanas","Sergeant Ulka","Dustwallow Marsh (Alcaz Island)",None,None,None,None,None,prereqs=["The Elite of the Elite"],sources=["https://wowforevercompass.com/dungeons/alcaz-prison/"]),
  ]),
 dict(name="Blackmaw Hold",levelRange=[55,60],location="Azshara",entrance=None,hordeAccess="Azshara; quests from Thunder Bluff, Mulgore and Azshara.",quests=[
   Q("Get to the Roots of It","Nara Wildmane","Thunder Bluff (Elder Rise)",75.8,31.2,None,None,None,sources=["https://www.warcrafttavern.com/forever/guides/blackmaw-hold/","https://endgametools.com/en/wow-forever/dungeons/blackmaw-hold"]),
   Q("Blackmaw Magic","Muln Earthfury","Mulgore (Skywatcher Plateau)",33.4,22.5,None,None,None,sources=["https://www.warcrafttavern.com/forever/guides/blackmaw-hold/","https://endgametools.com/en/wow-forever/dungeons/blackmaw-hold"]),
   Q("The Twin Bears","Lorekeeper Nok","Azshara (Ursolan)",None,None,None,None,None,sources=["https://www.warcrafttavern.com/forever/guides/blackmaw-hold/"],note="Shared-faction quests from Ekkal and Ogtinc in Azshara also reported; names not captured."),
  ]),
 dict(name="Shaper's Terrace",levelRange=[58,60],location="Northern hills of Un'Goro Crater",entrance={"zone":"Un'Goro Crater","x":48.1,"y":6.1,"source":"https://www.warcrafttavern.com/forever/guides/shapers-terrace/","verified":False},
  hordeAccess="Bring Un'Goro power crystals for the consoles inside (Blizzard).",quests=[
   Q("Crystalline Elements","Mayena Earthseeker","Mulgore (Skywatcher Plateau)",34.8,22.0,None,None,"Bring Moist, Charged, Noxious and Fiery Crystals from the dungeon",sources=["https://www.wowforeveraddon.com/guides/quests/the-shapers-terrace/","https://wowhelm.com/forever/dungeons/shapers-terrace"]),
   Q("Essence of Seeping Slimes","Chemist Fuely","Undercity (Apothecarium)",None,None,None,None,"Collect 8 Seeping Slime Essences",sources=["https://www.wowforeveraddon.com/guides/quests/the-shapers-terrace/"]),
   Q("The Dark Crystal","Master Apothecary Faranell","Undercity (Apothecarium)",None,None,None,None,"Get a Drained Crystal Fragment near the Achromatic Crystal",sources=["https://www.wowforeveraddon.com/guides/quests/the-shapers-terrace/"]),
  ]),
 dict(name="Hall of Thanes",levelRange=[13,18],location="Beneath Ironforge, Dun Morogh",entrance=None,hordeAccess="Hard: deep in Alliance territory (Blizzard). Low value for a Horde leveling route.",quests=[
   Q("An Ancient Grudge","Ghostly Attendant","Hall of Thanes (inside)",None,None,None,None,None,sources=["https://mobalytics.gg/wow-forever/dungeons/hall-of-thanes-dungeon-quests","https://epiccarry.com/blogs/hall-of-thanes-quests-wow-forever/"]),
  ]),
]
import re as _re
def dungeon_id(name):
    s=(name or "").lower().replace("'","").replace("’","").replace("`","")
    return _re.sub(r"[^a-z0-9]+","-",s).strip("-")
for d in NEW:
    d['id']=dungeon_id(d['name'])
    d['levelRangeSource']=BZ; d['verified']=False; d['inQuestieDB']=False
    d['note']="Forever-only dungeon. Fan-guide quests are enriched by match_forever.py against content/questie-db (QuestieDB v1.1.3). All remain verified:false until checked in game."
