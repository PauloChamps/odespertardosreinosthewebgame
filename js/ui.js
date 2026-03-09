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
      <div class="small">Mão: ${player.isBot ? "??" : player.hand.length} cartas</div>
      <div class="small">Personagens</div>
      <div class="slot-row">${player.characterSlots
        .map((s) => `<div class="slot character">${s ? s.name : "-"}</div>`)
        .join("")}</div>
      <div class="small">Mágicas</div>
      <div class="slot-row">${player.magicSlots
        .map((s) => `<div class="slot magic">${s ? s.name : "-"}</div>`)
        .join("")}</div>
    `;
    root.appendChild(card);
  }
}

export function renderBattlefield(players, root) {
  root.innerHTML = "";
  for (const player of players) {
    const side = document.createElement("div");
    side.className = "battle-side";
    const cards = [...player.characterSlots, ...player.magicSlots];
    side.innerHTML = `<h4>${player.name}</h4><div class="slot-row">${cards
      .map((c) => `<div class="slot">${c ? (player.isBot ? "🂠" : c.name) : "-"}</div>`)
      .join("")}</div>`;
    root.appendChild(side);
  }
}

export function renderHand(player, root, onPlayCard) {
  root.innerHTML = "";
  for (const card of player.hand) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${card.name}</strong>
      <div class="small">Tipo: ${card.type}</div>
      <div class="small">Facção: ${card.faction}</div>
      <div class="small">${
        card.type === "character"
          ? `G1 ${card.attacks.G1} / G2 ${card.attacks.G2} / G+ ${card.attacks.GPLUS}`
          : `Efeito ${card.effect} (${card.power})`
      }</div>
    `;
    div.addEventListener("click", () => onPlayCard(card.id));
    root.appendChild(div);
  }
}

export function appendLog(root, message) {
  root.textContent = `${message}\n${root.textContent}`.trim();
}
