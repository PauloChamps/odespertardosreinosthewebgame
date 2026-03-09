import { createPlayer, firstEmptyIndex, resetTurnFlags } from "./player.js";
import { drawCard } from "./deck.js";
import { createUIRefs, renderBattlefield, renderHand, renderPlayers, appendLog } from "./ui.js";
import { runBotMainPhase, botChooseBossAttack } from "./ai.js";
import { applyCharacterAttack, applyMagic, tickCooldowns } from "./combat.js";
import { getBossAttacks, resolveBossTurn, shouldSpawnBoss } from "./boss.js";

const ui = createUIRefs();
const state = {
  players: [],
  round: 1,
  turnIndex: 0,
  started: false,
};

function alivePlayers() {
  return state.players.filter((p) => p.alive);
}

function currentPlayer() {
  return state.players[state.turnIndex];
}

function nextAliveIndex(fromIndex) {
  for (let i = 1; i <= state.players.length; i++) {
    const idx = (fromIndex + i) % state.players.length;
    if (state.players[idx].alive) return idx;
  }
  return fromIndex;
}

function refreshUI() {
  const cp = currentPlayer();
  ui.roundCounter.textContent = `Rodada: ${state.round}`;
  ui.turnCounter.textContent = `Turno: ${cp?.name ?? "-"}`;
  renderPlayers(state.players, cp?.id, ui.playersArea);
  renderBattlefield(state.players, ui.battlefield);
  if (cp && !cp.isBot && cp.alive) renderHand(cp, ui.hand, playHumanCard);
  else ui.hand.innerHTML = "<div class='card hidden-card'>Aguarde o turno do bot...</div>";
  ui.endTurnBtn.disabled = !cp || cp.isBot || !cp.alive;
}

function log(msg) {
  appendLog(ui.log, msg);
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
  log("Jogo iniciado! Primeira rodada sem ataques.");
  refreshUI();
}

function playHumanCard(cardId) {
  const player = currentPlayer();
  if (!player || player.isBot) return;

  const index = player.hand.findIndex((c) => c.id === cardId);
  if (index < 0) return;
  const card = player.hand[index];

  if (card.type === "character") {
    if (player.usedCharacterThisTurn) return log("Você já invocou 1 personagem nesta rodada.");
    const slot = firstEmptyIndex(player.characterSlots);
    if (slot < 0) return log("Sem espaço para personagem.");
    player.hand.splice(index, 1);
    player.characterSlots[slot] = card;
    player.usedCharacterThisTurn = true;
    log(`Você invocou ${card.name}.`);
  } else {
    if (player.usedMagicThisTurn) return log("Você já ativou/colocou 1 magia nesta rodada.");
    const slot = firstEmptyIndex(player.magicSlots);
    if (slot < 0) return log("Sem espaço para carta mágica.");
    player.hand.splice(index, 1);
    player.magicSlots[slot] = card;
    const msg = applyMagic(card, player, state.players.filter((p) => p.id !== player.id));
    player.usedMagicThisTurn = true;
    log(msg);
  }
  refreshUI();
}

function executeAttacksFor(player) {
  if (state.round === 1) return;
  const opponents = state.players.filter((p) => p.id !== player.id && p.alive);
  if (!opponents.length) return;

  for (const card of player.characterSlots.filter(Boolean)) {
    const defenders = opponents.filter((p) => p.alive);
    if (!defenders.length) break;
    const defender = defenders[Math.floor(Math.random() * defenders.length)];
    const targetChar = defender.characterSlots.find(Boolean) ?? null;
    const result = applyCharacterAttack({ attacker: player, attackerCard: card, defender, targetCard: targetChar });

    log(`${player.name} usou ${result.attackType} com ${card.name} e causou ${result.damage} em ${defender.name}.`);
    if (!defender.alive) log(`${defender.name} foi derrotado!`);
    tickCooldowns(card);
  }
}

function handleBossIfNeeded() {
  if (!shouldSpawnBoss(state.round)) return;
  const attacks = getBossAttacks();
  const chooser = (player) => {
    if (player.isBot) return botChooseBossAttack();
    const list = attacks.map((a) => `${a.id}`).join(", ");
    const pick = Number(window.prompt(`Boss apareceu! Escolha ataque ${list}:`, "1"));
    return [1, 2, 3, 4].includes(pick) ? pick : 1;
  };
  const logs = resolveBossTurn(state.players, chooser);
  logs.forEach(log);
}

function botTurnLoop() {
  while (state.started && currentPlayer()?.isBot && currentPlayer()?.alive) {
    const bot = currentPlayer();
    resetTurnFlags(bot);
    drawCard(bot);
    runBotMainPhase(bot, state.players.filter((p) => p.id !== bot.id), log);
    executeAttacksFor(bot);
    advanceTurn(false);
  }
}

function checkGameOver() {
  const living = alivePlayers();
  if (living.length <= 1) {
    state.started = false;
    if (living[0]) log(`Fim de jogo! Vencedor: ${living[0].name}`);
    else log("Fim de jogo! Sem vencedores.");
    ui.endTurnBtn.disabled = true;
    return true;
  }
  return false;
}

function advanceTurn(triggeredByPlayer = true) {
  if (!state.started) return;
  const cp = currentPlayer();
  if (cp && cp.alive) executeAttacksFor(cp);

  state.turnIndex = nextAliveIndex(state.turnIndex);
  if (state.turnIndex === 0) {
    state.round += 1;
    handleBossIfNeeded();
    for (const p of state.players.filter((x) => x.alive)) {
      resetTurnFlags(p);
      drawCard(p);
    }
  }

  refreshUI();
  if (checkGameOver()) return;
  if (triggeredByPlayer) botTurnLoop();
}

ui.startGameBtn.addEventListener("click", startGame);
ui.endTurnBtn.addEventListener("click", () => advanceTurn(true));
