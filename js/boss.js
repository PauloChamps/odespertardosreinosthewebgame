const bossAttacks = [
  { id: 1, name: "Ruptura Abissal", damage: 180 },
  { id: 2, name: "Meteoro Sombrio", damage: 260 },
  { id: 3, name: "Grito do Vazio", damage: 320 },
  { id: 4, name: "Lâmina do Fim", damage: 400 },
];

export function shouldSpawnBoss(round) {
  return round > 0 && round % 3 === 0;
}

export function resolveBossTurn(players, chooser) {
  const alive = players.filter((p) => p.alive);
  const logs = ["⚠️ Um Boss apareceu e atacará os jogadores!"];

  for (const player of alive) {
    const selected = chooser(player, bossAttacks);
    const attack = bossAttacks.find((a) => a.id === selected) || bossAttacks[0];
    player.hp = Math.max(0, player.hp - attack.damage);
    if (player.hp === 0) player.alive = false;
    logs.push(`${player.name} escolheu golpe ${selected} e recebeu ${attack.damage} de dano.`);
  }

  return logs;
}

export function getBossAttacks() {
  return bossAttacks;
}
