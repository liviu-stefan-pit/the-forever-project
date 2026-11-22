/**
 * QuestieDB race/class bitmasks. `0` means the quest is not restricted.
 *
 * Skyborne is 2^33 (8589934592). Confirmed in content/questie-db/quests.json:
 * 93836 races 8589934770 = Orc|Undead|Tauren|Troll|Skyborne (178 + 2^33),
 * 98340 races 8589934624 = Tauren|Skyborne (32 + 2^33),
 * and Skyborne-only quests such as 92598 and 95350 store 8589934592 alone.
 */
export const RACE_MASK: Record<string, number> = {
  Orc: 2,
  Undead: 16,
  Tauren: 32,
  Troll: 128,
  Skyborne: 8589934592,
};

export const CLASS_MASK: Record<string, number> = {
  Warrior: 1,
  Paladin: 2,
  Hunter: 4,
  Rogue: 8,
  Priest: 16,
  Shaman: 64,
  Mage: 128,
  Warlock: 256,
  Druid: 1024,
};

/** True when `mask` has the single power-of-two `bit` set. Safe past bit 31 (JS `&` is 32-bit). */
function maskHasBit(mask: number, bit: number): boolean {
  if (!Number.isFinite(mask) || !Number.isFinite(bit) || bit <= 0) return false;
  return Math.floor(mask / bit) % 2 === 1;
}

/** True when a non-zero mask does not include this character's bit. */
export function maskExcludes(mask: number | undefined, bit: number | undefined): boolean {
  return !!mask && bit !== undefined && !maskHasBit(mask, bit);
}
