import { createDeck, drawCard } from "./deck.js";

export function createPlayer(id, name, isBot = false) {
  const player = {
    id,
    name,
    isBot,
    hp: 3000,
    deck: createDeck(),
    hand: [],
    characterSlots: Array(5).fill(null),
    magicSlots: Array(5).fill(null),
    graveyard: [],
    usedCharacterThisTurn: false,
    usedMagicThisTurn: false,
    alive: true,
  };

  for (let i = 0; i < 7; i++) drawCard(player);
  return player;
}

export function resetTurnFlags(player) {
  player.usedCharacterThisTurn = false;
  player.usedMagicThisTurn = false;
}

export function firstEmptyIndex(slots) {
  return slots.findIndex((slot) => slot === null);
}
