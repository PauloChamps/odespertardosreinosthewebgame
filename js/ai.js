import { firstEmptyIndex } from "./player.js";

export function runBotMainPhase(player, opponents, log) {
  const charIdx = player.hand.findIndex((c) => c.type === "character");
  const magicIdx = player.hand.findIndex((c) => c.type === "magic");

  if (!player.usedCharacterThisTurn && charIdx >= 0) {
    const slot = firstEmptyIndex(player.characterSlots);
    if (slot >= 0) {
      const [card] = player.hand.splice(charIdx, 1);
      player.characterSlots[slot] = card;
      player.usedCharacterThisTurn = true;
      log(`${player.name} invocou ${card.name}.`);
    }
  }

  if (!player.usedMagicThisTurn && magicIdx >= 0) {
    const slot = firstEmptyIndex(player.magicSlots);
    if (slot >= 0) {
      const [card] = player.hand.splice(magicIdx, 1);
      player.magicSlots[slot] = card;
      player.usedMagicThisTurn = true;
      log(`${player.name} posicionou magia ${card.name}.`);
    }
  }

  return opponents.filter((o) => o.alive);
}

export function botChooseBossAttack() {
  return 1 + Math.floor(Math.random() * 4);
}
