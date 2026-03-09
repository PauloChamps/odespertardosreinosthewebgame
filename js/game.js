import { createPlayer, firstEmptyIndex, resetTurnFlags } from "./player.js";
import { drawCard } from "./deck.js";
import {
  createUIRefs,
  renderBattlefield,
  renderHand,
  renderPlayers,
  appendLog,
  renderBotHand,
  showBossField,
  hideBossField,
  renderCharacterCatalog,
} from "./ui.js";
import { runBotMainPhase, runBotAttackPhase, botChooseBossAttack } from "./ai.js";
import { applyCharacterAttack, applyMagicEffect, canUseAttack, startTurnCooldownTick } from "./combat.js";
import { resolveBossTurn, shouldSpawnBoss } from "./boss.js";
import { CHARACTER_CATALOG } from "./cards.js";

const ui = createUIRefs();
const state = { players: [], round: 1, turnIndex: 0, started: false };

function currentPlayer() {
  return state.players[state.turnIndex];
}

function alivePlayers() {
  return state.players.filter((p) => p.alive);
}

function nextAliveIndex(fromIndex) {
  for (let i = 1; i <= state.players.length; i++) {
    const idx = (fromIndex + i) % state.players.length;
    if (state.players[idx].alive) return idx;
  }
  return fromIndex;
}

function log(msg) {
  appendLog(ui.log, msg);
}

function refreshUI() {
  const cp = currentPlayer();
  ui.roundCounter.textContent = `Rodada: ${state.round}`;
  ui.turnCounter.textContent = `Turno: ${cp?.name ?? "-"}`;
  renderPlayers(state.players, cp?.id, ui.playersArea);
  renderBattlefield(state.players, ui.battlefield);
  renderBotHand(state.players, ui.botHand);
  renderCharacterCatalog(CHARACTER_CATALOG, ui.cardCatalog);

  if (cp && !cp.isBot && cp.alive) renderHand(cp, ui.hand, playHumanCard);
  else ui.hand.innerHTML = "<div class='card hidden-card'>Aguarde o turno dos bots...</div>";

  ui.endTurnBtn.disabled = !cp || cp.isBot || !cp.alive;
  ui.surrenderBtn.disabled = !state.started || !state.players[0]?.alive;
}

function finishGame(message) {
  state.started = false;
  ui.endTurnBtn.disabled = true;
  ui.surrenderBtn.disabled = true;
  log(message);
}

function surrenderMatch() {
  if (!state.started) return;
  const player = state.players.find((p) => !p.isBot);
  if (!player || !player.alive) return;
  player.alive = false;
  player.hp = 0;
  finishGame("Você desistiu da partida.");
  refreshUI();
}

function startGame() {
  const total = Number(ui.playerCount.value);
  state.players = [createPlayer(1, "Você", false)];
  for (let i = 2; i <= total; i++) state.players.push(createPlayer(i, `Bot ${i - 1}`, true));

  state.round = 1;
  state.turnIndex = 0;
  state.started = true;

  ui.setupPanel.classList.add("hidden");
  ui.table.classList.remove("hidden");
  ui.log.textContent = "";
  hideBossField(ui);

  log("Jogo iniciado. Rodada 1 sem ataques.");
  refreshUI();
}

function playHumanCard(cardId) {
  const player = currentPlayer();
  if (!player || player.isBot || !player.alive) return;

  const handIndex = player.hand.findIndex((c) => c.id === cardId);
  if (handIndex < 0) return;
  const card = player.hand[handIndex];

  if (card.type === "character") {
    if (player.usedCharacterThisTurn) return log("Limite: 1 personagem por rodada.");
    const slot = firstEmptyIndex(player.characterSlots);
    if (slot < 0) return log("Sem espaço para personagem.");

    player.hand.splice(handIndex, 1);
    player.characterSlots[slot] = card;
    player.usedCharacterThisTurn = true;
    log(`Você invocou ${card.name}.`);
    return refreshUI();
  }

  if (player.usedMagicThisTurn) return log("Limite: 1 magia ativada por rodada.");

  player.hand.splice(handIndex, 1);
  player.usedMagicThisTurn = true;

  const allies = [player];
  const enemies = state.players.filter((p) => p.id !== player.id && p.alive);
  const targetInfo = chooseHumanMagicTarget(card, enemies);
  log(applyMagicEffect(card, player, allies, enemies, targetInfo));
  player.graveyard.push(card);
  log(`${card.name} foi para o cemitério.`);
  refreshUI();
}

function chooseHumanMagicTarget(card, enemies) {
  if (card.target === "ally_player") return { playerIndex: 0, slotIndex: 0 };
  if (card.target === "ally_character") {
    const slotIndex = Number(window.prompt("Escolha slot aliado (0-4):", "0"));
    return { playerIndex: 0, slotIndex: Number.isInteger(slotIndex) ? slotIndex : 0 };
  }

  const enemyList = enemies.map((e, idx) => `${idx}-${e.name}`).join(" | ");
  const playerIndex = Number(window.prompt(`Escolha inimigo: ${enemyList}`, "0"));
  const slotIndex = Number(window.prompt("Escolha slot inimigo (0-4):", "0"));
  return { playerIndex: Number.isInteger(playerIndex) ? playerIndex : 0, slotIndex: Number.isInteger(slotIndex) ? slotIndex : 0 };
}

function chooseHumanAttack(attackerCard, opponents) {
  const available = Object.keys(attackerCard.attacks);
  const atk = (window.prompt(`Escolha ataque: ${available.join(", ")}`, available[0]) || available[0]).toUpperCase();
  const attackType = atk === "G+" ? "GPLUS" : atk;
  if (!available.includes(attackType)) return null;
  if (!canUseAttack(attackerCard, attackType)) return log(`Ataque ${attackType} em recarga.`), null;

  const opponentList = opponents.map((p, i) => `${i}-${p.name}`).join(" | ");
  const opIndex = Number(window.prompt(`Escolha alvo jogador: ${opponentList}`, "0"));
  const defender = opponents[opIndex] ?? opponents[0];
  const targetType = (window.prompt("Alvo: P (jogador) ou C (personagem)", "C") || "C").toUpperCase();

  if (targetType === "C") {
    const slotIndex = Number(window.prompt("Escolha slot do personagem inimigo (0-4)", "0"));
    return { attackType, defender, targetType: "character", targetSlotIndex: Number.isInteger(slotIndex) ? slotIndex : 0 };
  }

  return { attackType, defender, targetType: "player", targetSlotIndex: -1 };
}

function executeAttacksFor(player) {
  if (state.round === 1) return;
  const opponents = state.players.filter((p) => p.id !== player.id && p.alive);
  if (!opponents.length) return;

  if (player.isBot) return runBotAttackPhase(player, opponents, log);

  for (const attackerCard of player.characterSlots.filter(Boolean)) {
    const selection = chooseHumanAttack(attackerCard, opponents);
    if (!selection) continue;

    const result = applyCharacterAttack({
      attackerCard,
      attackType: selection.attackType,
      defender: selection.defender,
      targetType: selection.targetType,
      targetSlotIndex: selection.targetSlotIndex,
    });

    log(result.ok ? `Você atacou com ${selection.attackType} causando ${result.damage}.` : result.message);
    refreshUI();
  }
}

function handleBossIfNeeded() {
  if (!shouldSpawnBoss(state.round)) return;
  const turnPlayer = currentPlayer();

  const chooser = (attacks) => {
    if (turnPlayer?.isBot) return botChooseBossAttack();
    const options = attacks.map((a) => `${a.id}-${a.name}`).join(" | ");
    const selected = Number(window.prompt(`Boss apareceu! Escolha o golpe: ${options}`, "1"));
    return [1, 2, 3, 4].includes(selected) ? selected : 1;
  };

  const { boss, logs } = resolveBossTurn(state.players, chooser, state.round);
  showBossField(ui, boss);
  logs.forEach(log);
  setTimeout(() => hideBossField(ui), 2200);
}

function startTurn(player) {
  resetTurnFlags(player);
  startTurnCooldownTick(player);
  drawCard(player);
}

function botTurnLoop() {
  while (state.started && currentPlayer()?.isBot && currentPlayer()?.alive) {
    const bot = currentPlayer();
    startTurn(bot);
    runBotMainPhase(bot, state.players, log);
    executeAttacksFor(bot);
    advanceTurn(false);
  }
}

function checkGameOver() {
  const living = alivePlayers();
  if (living.length <= 1) {
    finishGame(living[0] ? `Fim de jogo! Vencedor: ${living[0].name}` : "Fim de jogo! Sem vencedores.");
    return true;
  }
  return false;
}

function advanceTurn(triggeredByPlayer = true) {
  if (!state.started) return;
  state.turnIndex = nextAliveIndex(state.turnIndex);
  if (state.turnIndex === 0) state.round += 1;

  handleBossIfNeeded();
  const cp = currentPlayer();
  if (cp?.alive) startTurn(cp);

  refreshUI();
  if (checkGameOver()) return;
  if (triggeredByPlayer) botTurnLoop();
}

ui.startGameBtn.addEventListener("click", startGame);
ui.endTurnBtn.addEventListener("click", () => {
  const cp = currentPlayer();
  if (cp?.alive) executeAttacksFor(cp);
  advanceTurn(true);
});
ui.surrenderBtn.addEventListener("click", surrenderMatch);
