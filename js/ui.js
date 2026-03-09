export function createUIRefs() {
  return {
    setupPanel: document.getElementById("setupPanel"),
    playerCount: document.getElementById("playerCount"),
    startGameBtn: document.getElementById("startGameBtn"),
    table: document.getElementById("table"),
    playersArea: document.getElementById("playersArea"),
    battlefield: document.getElementById("battlefield"),
    hand: document.getElementById("hand"),
    log: document.getElementById("statusLog"),
    roundCounter: document.getElementById("roundCounter"),
    turnCounter: document.getElementById("turnCounter"),
    endTurnBtn: document.getElementById("endTurnBtn"),
  };
}

export function renderPlayers(players, activePlayerId, root) {
  root.innerHTML = "";
  for (const player of players) {
    const hpClass = !player.alive ? "dead" : player.hp < 1000 ? "low" : "alive";
    const card = document.createElement("article");
    card.className = `player-card ${player.id === activePlayerId ? "active" : ""}`;
    card.innerHTML = `
      <strong>${player.name}${player.isBot ? " (BOT)" : ""}</strong>
      <div class="hp ${hpClass}">HP: ${player.hp}</div>
      <div class="small">Mão: ${player.isBot ? "🂠🂠🂠" : `${player.hand.length} cartas`}</div>
    `;
    root.appendChild(card);
  }
}

function slotHTML(card, kind, hideCard = false) {
  if (!card) return `<div class="slot ${kind}">-</div>`;
  if (hideCard) return `<div class="slot ${kind} back">🂠</div>`;
  return `<div class="slot ${kind}" title="img: ${card.image}">${card.name}</div>`;
}

export function renderBattlefield(players, root) {
  root.innerHTML = "";
  const human = players.find((p) => !p.isBot);
  const bots = players.filter((p) => p.isBot);

  const top = document.createElement("div");
  top.className = "battle-row top";
  bots.forEach((bot) => {
    const zone = document.createElement("section");
    zone.className = "battle-zone";
    zone.innerHTML = `
      <h4>${bot.name}</h4>
      <div class="zone-label">Personagens</div>
      <div class="slot-row">${bot.characterSlots.map((c) => slotHTML(c, "character", true)).join("")}</div>
      <div class="zone-label">Mágicas</div>
      <div class="slot-row">${bot.magicSlots.map((c) => slotHTML(c, "magic", true)).join("")}</div>
    `;
    top.appendChild(zone);
  });

  const bottom = document.createElement("div");
  bottom.className = "battle-row bottom";
  if (human) {
    bottom.innerHTML = `
      <section class="battle-zone player-zone">
        <h4>${human.name}</h4>
        <div class="zone-label">Personagens</div>
        <div class="slot-row">${human.characterSlots.map((c) => slotHTML(c, "character", false)).join("")}</div>
        <div class="zone-label">Mágicas</div>
        <div class="slot-row">${human.magicSlots.map((c) => slotHTML(c, "magic", false)).join("")}</div>
      </section>
    `;
  }

  root.appendChild(top);
  root.appendChild(bottom);
}

export function renderHand(player, root, onPlayCard) {
  root.innerHTML = "";
  for (const card of player.hand) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${card.name}</strong>
      <div class="small">Tipo: ${card.type}</div>
      <div class="small">ATK: ${card.attack} | HP: ${card.hp}</div>
      <div class="small">Imagem: ${card.image}</div>
      <div class="small">${
        card.type === "character"
          ? `G1 ${card.attacks.G1} / G2 ${card.attacks.G2} / G+ ${card.attacks.GPLUS}`
          : `${card.effectType} (${card.value})`
      }</div>
    `;
    div.addEventListener("click", () => onPlayCard(card.id));
    root.appendChild(div);
  }
}

export function appendLog(root, message) {
  const lines = root.textContent ? root.textContent.split("\n") : [];
  const next = [message, ...lines].slice(0, 8);
  root.textContent = next.join("\n");
}
