import { firstEmptyIndex } from "./player.js";
import { applyMagicEffect, canUseAttack, applyCharacterAttack } from "./combat.js";

<<<<<<< codex/create-card-game-o-despertar-dos-reinos-01xqdf
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

=======
>>>>>>> main
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

<<<<<<< codex/create-card-game-o-despertar-dos-reinos-01xqdf
  const availableEnemies = opponents.filter((p) => p.characterSlots.some(Boolean));
  const chosenEnemy = availableEnemies.length ? randomItem(availableEnemies) : opponents[0];
  const playerIndex = opponents.findIndex((p) => p.id === chosenEnemy?.id);
  const slotIndex = chosenEnemy?.characterSlots.findIndex(Boolean) ?? 0;
  return { playerIndex: Math.max(0, playerIndex), slotIndex: Math.max(0, slotIndex) };
=======
  const enemyIndex = opponents.findIndex((p) => p.characterSlots.some(Boolean));
  const chosenEnemy = opponents[Math.max(0, enemyIndex)] ?? opponents[0];
  const slotIndex = chosenEnemy?.characterSlots.findIndex(Boolean) ?? 0;
  return { playerIndex: Math.max(0, enemyIndex), slotIndex: Math.max(0, slotIndex) };
>>>>>>> main
}

export function runBotAttackPhase(player, opponents, log) {
  for (const attackerCard of player.characterSlots.filter(Boolean)) {
<<<<<<< codex/create-card-game-o-despertar-dos-reinos-01xqdf
    const aliveOpponents = opponents.filter((op) => op.alive);
    if (!aliveOpponents.length) break;

    // Bot também ataca outros bots: alvo é sorteado entre todos os oponentes vivos.
    const enemy = randomItem(aliveOpponents);
=======
    const enemy = opponents.find((op) => op.alive);
    if (!enemy) break;

>>>>>>> main
    const enemyCharIndex = enemy.characterSlots.findIndex(Boolean);
    const targetType = enemyCharIndex >= 0 ? "character" : "player";
    const targetSlotIndex = enemyCharIndex >= 0 ? enemyCharIndex : -1;

    const attackType = canUseAttack(attackerCard, "GPLUS")
      ? "GPLUS"
      : canUseAttack(attackerCard, "G2")
      ? "G2"
      : "G1";

    const result = applyCharacterAttack({ attackerCard, attackType, defender: enemy, targetType, targetSlotIndex });
<<<<<<< codex/create-card-game-o-despertar-dos-reinos-01xqdf
    if (result.ok) log(`${player.name} atacou ${enemy.name} com ${attackType} e causou ${result.damage}.`);
=======
    if (result.ok) log(`${player.name} atacou com ${attackType} e causou ${result.damage}.`);
>>>>>>> main
  }
}

export function botChooseBossAttack() {
  return 1 + Math.floor(Math.random() * 4);
}
