import { createCharacterCard, createMagicCard } from "./cards.js";

export function createDeck() {
  const cards = [];
  for (let i = 1; i <= 40; i++) {
    const card = i <= 24 ? createCharacterCard(i) : createMagicCard(i);
    cards.push(card);
  }
  return shuffle(cards);
}

export function shuffle(cards) {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function drawCard(player) {
  if (player.deck.length === 0) return null;
  const card = player.deck.pop();
  player.hand.push(card);
  return card;
}
