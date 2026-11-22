"""Shared constants and step constructors for the Nova 1-20 route specs."""
HH = 'https://www.hardcorehelper.com/forever/guides/'
WF = 'https://wowfdb.com/zones/'
FOREVER_SRC = {
    'Durotar': [HH + 'durotar-leveling-guide', WF + 'durotar/'],
    'Mulgore': [HH + 'mulgore-leveling-guide', WF + 'mulgore/'],
    'Tirisfal Glades': [HH + 'tirisfal-glades-leveling-guide', WF + 'tirisfal-glades/'],
    'The Barrens': ['https://wowforeverguides.com/zones/the-barrens', WF + 'the-barrens/', 'https://hackverso.com/en/wowforever/leveling/'],
    'Orgrimmar': ['https://hackverso.com/en/wowforever/leveling/'],
}
WH = 'https://www.wowhead.com/classic/'
HOOKS = {
    'scorpid_surprise': {'profession': 'Cooking', 'keep': 'Scorpid Stinger', 'keepItemId': 5466,
        'dropsFrom': ['Clattering Scorpid', 'Armored Scorpid', 'Venomtail Scorpid'],
        'recipe': 'Recipe: Scorpid Surprise', 'recipeItemId': 5483,
        'vendor': {'id': 3881, 'name': 'Grimtak', 'x': 51.1, 'y': 42.6, 'zone': 'Durotar', 'zoneMapId': 1411},
        'text': 'Keep every Scorpid Stinger. Grimtak, the Razor Hill butcher, sells Recipe: Scorpid Surprise; cook the stingers there for early Cooking skill and free food.',
        'sources': [WH + 'item=5483', WH + 'item=5466', WH + 'npc=3881']},
    'crispy_bat_wing': {'profession': 'Cooking', 'keep': 'Meaty Bat Wing', 'keepItemId': 12223,
        'dropsFrom': ['Greater Duskbat', 'Vampiric Duskbat'], 'recipe': 'Recipe: Crispy Bat Wing', 'recipeItemId': 12226,
        'vendor': {'id': 2118, 'name': 'Abigail Shiel', 'x': 61.0, 'y': 52.4, 'zone': 'Tirisfal Glades', 'zoneMapId': 1420},
        'text': 'Keep Meaty Bat Wings from the duskbats. Abigail Shiel (Trade Supplies, Brill) sells Recipe: Crispy Bat Wing.',
        'sources': [WH + 'item=12226', WH + 'item=12223', WH + 'npc=2118']},
    'roasted_kodo': {'profession': 'Cooking', 'keep': 'Kodo Meat', 'keepItemId': 5467,
        'dropsFrom': ['Barrens Kodo', 'Kodo Calf', 'Kodo Bull'], 'recipe': 'Recipe: Roasted Kodo Meat', 'recipeItemId': 5484,
        'vendor': {'id': 3081, 'name': 'Wunna Darkmane', 'x': 45.6, 'y': 61.7, 'zone': 'Mulgore', 'zoneMapId': 1412},
        'text': 'Kodo Meat drops from Barrens kodos. Wunna Darkmane (Trade Goods, Bloodhoof Village) sells Recipe: Roasted Kodo Meat; buy it before you leave Mulgore.',
        'sources': [WH + 'item=5484', WH + 'item=5467', WH + 'npc=3081']},
    'strider_stew': {'profession': 'Cooking', 'keep': 'Strider Meat', 'keepItemId': 5469,
        'dropsFrom': ['Greater Plainstrider', 'Ornery Plainstrider', 'Fleeting Plainstrider'], 'recipe': 'Recipe: Strider Stew', 'recipeItemId': 5486,
        'vendor': {'id': 3482, 'name': "Tari'qa", 'x': 51.7, 'y': 30.0, 'zone': 'The Barrens', 'zoneMapId': 1413},
        'text': "Keep Strider Meat from the plainstriders you kill for Plainstrider Menace. Tari'qa (Trade Supplies, the Crossroads) sells Recipe: Strider Stew.",
        'sources': [WH + 'item=5486', WH + 'item=5469', WH + 'npc=3482']},
    'crispy_lizard_tail': {'profession': 'Cooking', 'keep': 'Thunder Lizard Tail', 'keepItemId': 5470,
        'dropsFrom': ['Stormsnout', 'Thunderhead'], 'recipe': 'Recipe: Crispy Lizard Tail', 'recipeItemId': 5488,
        'vendor': {'id': 3482, 'name': "Tari'qa", 'x': 51.7, 'y': 30.0, 'zone': 'The Barrens', 'zoneMapId': 1413},
        'text': "Thunder lizards drop Thunder Lizard Tails. Tari'qa at the Crossroads sells Recipe: Crispy Lizard Tail.",
        'sources': [WH + 'item=5488', WH + 'item=5470', WH + 'npc=3482']},
    'hot_lion_chops': {'profession': 'Cooking', 'keep': 'Lion Meat', 'keepItemId': 3731,
        'dropsFrom': ['Echeyakee'], 'recipe': 'Recipe: Hot Lion Chops', 'recipeItemId': 3735,
        'vendor': {'id': 3489, 'name': 'Zargh', 'x': 52.6, 'y': 29.8, 'zone': 'The Barrens', 'zoneMapId': 1413},
        'text': 'Lion Meat is a mid-level Cooking reagent; bank it. Zargh (Butcher, the Crossroads) sells Recipe: Hot Lion Chops.',
        'sources': [WH + 'item=3735', WH + 'item=3731', WH + 'npc=3489']},
    'deviate_leather': {'profession': 'Leatherworking', 'keep': 'Deviate Scale', 'recipe': 'Pattern: Deviate Scale Cloak / Gloves',
        'recipeItemId': 6474, 'vendor': {'id': 5783, 'name': 'Kalldan Felmoon', 'x': 45.9, 'y': 35.7, 'zone': 'The Barrens', 'zoneMapId': 1413},
        'text': 'Leatherworkers: Kalldan Felmoon outside Wailing Caverns sells Pattern: Deviate Scale Cloak and Deviate Scale Gloves. Keep spare Deviate Scales from the deviate beasts here.',
        'sources': [WH + 'item=6474', WH + 'item=6475', WH + 'npc=5783'], 'unverifiedParts': ['Deviate Scale drop list not checked']},
    'galgar_books': {'profession': 'Any gathering', 'text': "Forever change: Galgar's Cactus Apple Surprise now lets you pick a gathering starter book (Mining for Dummies, Wild Harvest or Pelt Collecting for Beginners) as well as the Cactus Apple Surprise recipe. Pick the one for your planned gathering profession.",
        'sources': [HH + 'durotar-leveling-guide', WF + 'durotar/']},
    'camping_101': {'profession': 'All', 'text': 'Forever adds a Camping 101 quest per profession (level 6). Take the one for each profession you train: they hand out a camp object for that profession.',
        'sources': [WF + 'durotar/', 'https://hackverso.com/en/wowforever/leveling/'], 'unverifiedParts': ['quest givers and exact rewards']},
}

WM = 'https://warcraftmaps.com/guides/classic-vs-forever-professions'
PROF_TIPS_START = [
    {'text': 'Forever: each creature can only be skinned once, so skin your own kills right away before someone else does.', 'sources': [WM], 'verified': True},
    {'text': 'Forever: every profession gets a camp object at skill 20. Push your professions to 20 early to unlock it.', 'sources': [WM], 'verified': True},
    {'text': 'Forever: crafting items to sell to vendors no longer pays (vendor prices were cut on 16 Oct). Craft for skill-ups, your own gear and other players.', 'sources': [WM], 'verified': True},
    {'text': 'Forever: healing potions are made with First Aid now, so keep your Linen Cloth for First Aid.', 'sources': ['https://theforeverguides.com/professions/cloth-farming/'], 'verified': False},
    {'text': 'Forever: starter-zone Herbalism and Skinning trainers teach only the first rank. Train the next rank in your capital.', 'sources': ['https://theforeverguides.com/professions/crafting-trainers/'], 'verified': False},
]
MF_SRC = ['https://www.method.gg/wow-forever/how-to-get-waylaid-crates-and-merchants-favor-in-wow-forever', 'https://mobalytics.gg/wow-forever/guides/waylaid-crates-explained', 'https://www.classic-wow.com/database/npc/256386/dokimi']

def B(*a): return ('both',) + a
def Bal(*a): return ('balanced',) + a
def Spd(*a): return ('speedrun',) + a
F = {'forever': True}
def f(**kw): kw['forever'] = True; return kw

ELITE_ZAL = {'tip': 'Zalazane is a caster on the Echo Isles surrounded by hexed trolls. Clear the trolls around him first, then fight him alone.',
             'tank': 'Pull the guards one at a time, then take Zalazane with interrupts ready.',
             'healer': 'Group with someone if you can; solo, kill him slowly and keep your mana for heals.',
             'dps': 'Burst him down. If you are a melee class, use your stun when his health gets low so he cannot heal.'}
