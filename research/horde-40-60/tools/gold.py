import json
from content import QS, wh, LEG
G=[
 {"levels":[40,60],"text":"Vendor every grey and sell all cloth, leather and ore you do not use. Mageweave (STV, Arathi, Desolace) and Runecloth (Plaguelands, Blackrock) are the steadiest auction sellers on this route.","sources":[QS,wh("item",4338),wh("item",14047)],"verified":True},
 {"levels":[52,56],"text":"Skinners: Devilsaurs in Un'Goro drop Devilsaur Leather, one of the most valuable leathers before raids. Kill and skin every devilsaur you can solo safely.","sources":[wh("item",15417)],"verified":False},
 {"levels":[50,60],"text":"Miners: Thorium veins are densest in Eastern Plaguelands, Winterspring, Un'Goro, Felwood and Burning Steppes. Rich Thorium can contain Arcane Crystal, which sells high.","sources":[QS,wh("item",10620),wh("item",12363)],"verified":True},
 {"levels":[50,60],"text":"Herbalists: Felwood and Un'Goro for Dreamfoil, Winterspring for Mountain Silversage, Plaguelands and Felwood for Plaguebloom. These are flask herbs that raiders buy every week.","sources":[QS,wh("item",13463),wh("item",13465),wh("item",13466)],"verified":True},
 {"levels":[54,58],"text":"Felwood satyrs drop Felcloth; tailors and warlocks buy it.","sources":[QS,wh("item",14256)],"verified":True},
 {"levels":[55,60],"text":"Essence of Undeath drops from undead in Scholomance, Stratholme and the Plaguelands; Essence of Earth and Elemental Fire come from elementals in Burning Steppes, Un'Goro and Searing Gorge. All three sell to crafters.","sources":[QS,wh("item",12808),wh("item",7076),wh("item",7068)],"verified":True},
 {"levels":[40,60],"text":"Do not buy every new spell rank. Skip ranks of abilities you do not use while leveling and train them at 60 when you have the gold.","sources":[QS],"verified":False},
 {"levels":[40,60],"text":"WoW Forever: turning in supply crates to the Azeroth Commerce Authority or Durotar Supply and Logistics earns Merchant's Favor, and the Legacy perk Performance Bonus can double it. Check the vendor's reward list before you spend materials on crates.","sources":[LEG],"verified":False},
 {"levels":[40,60],"text":"WoW Forever: the Legacy perk Frequent Flier halves flight costs and speeds up flights. On a route this flight-heavy it saves gold and time; take it if you have Legacy points to spare.","sources":[LEG,{"url":"https://wowfwiki.com/wiki/Leveling_and_experience","label":"WoW Forever wiki: Leveling and experience"}],"verified":False},
 {"levels":[58,60],"text":"Save for the epic mount at 60: it costs about 1000 gold in Classic-era prices. Every gold tip above is aimed at reaching that on arrival.","sources":[{"url":"https://warcraft.wiki.gg/wiki/Mount","label":"Warcraft Wiki: Mount"}],"verified":False},
]
json.dump(G,open("out/gold.json","w"),indent=1,ensure_ascii=False); print(len(G))
