import { firstEmptyIndex } from "./player.js";
import { applyMagicEffect, canUseAttack, applyCharacterAttack } from "./combat.js";

export function runBotMainPhase(player, allPlayers, log) {
  const opponents = allPlayers.filter((p) => p.id !== player.id && p.alive);
  const allies = allPlayers.filter((p) => p.id === player.id);

  const charIdx = player.hand.findIndex((c) => c.type === "character");
  if (!player.usedCharacterThisTurn && charIdx >= 0) {
    const slot = firstEmptyIndex(player.characterSlots);
    if (slot >= 0) {
      const [card] = player.hand.splice(charIdx, 1);
      player.characterSlots[slot] = card;
      player.usedCharacterThisTurn = true;
      log(`${player.name} invocou ${card.name}.`);
    }
  }

  const magicIdx = player.hand.findIndex((c) => c.type === "magic");
  if (!player.usedMagicThisTurn && magicIdx >= 0) {
    const [card] = player.hand.splice(magicIdx, 1);
    player.usedMagicThisTurn = true;
    const targetInfo = chooseBotMagicTarget(card, allies, opponents);
    log(applyMagicEffect(card, player, allies, opponents, targetInfo));
    player.graveyard.push(card);
    log(`${player.name} enviou ${card.name} para o cemitério.`);
  }
}

function chooseBotMagicTarget(card, allies, opponents) {
  if (card.target === "ally_player") return { playerIndex: 0, slotIndex: 0 };

  if (card.target === "ally_character") {
    const ally = allies[0];
    const slotIndex = ally.characterSlots.findIndex(Boolean);
    return { playerIndex: 0, slotIndex: Math.max(0, slotIndex) };
  }

  const enemyIndex = opponents.findIndex((p) => p.characterSlots.some(Boolean));
  const chosenEnemy = opponents[Math.max(0, enemyIndex)] ?? opponents[0];
  const slotIndex = chosenEnemy?.characterSlots.findIndex(Boolean) ?? 0;
  return { playerIndex: Math.max(0, enemyIndex), slotIndex: Math.max(0, slotIndex) };
}

export function runBotAttackPhase(player, opponents, log) {
  for (const attackerCard of player.characterSlots.filter(Boolean)) {
    const enemy = opponents.find((op) => op.alive);
    if (!enemy) break;

    const enemyCharIndex = enemy.characterSlots.findIndex(Boolean);
    const targetType = enemyCharIndex >= 0 ? "character" : "player";
    const targetSlotIndex = enemyCharIndex >= 0 ? enemyCharIndex : -1;

    const attackType = canUseAttack(attackerCard, "GPLUS")
      ? "GPLUS"
      : canUseAttack(attackerCard, "G2")
      ? "G2"
      : "G1";

    const result = applyCharacterAttack({ attackerCard, attackType, defender: enemy, targetType, targetSlotIndex });
    if (result.ok) log(`${player.name} atacou com ${attackType} e causou ${result.damage}.`);
  }
}

export function botChooseBossAttack() {
  return 1 + Math.floor(Math.random() * 4);
}
