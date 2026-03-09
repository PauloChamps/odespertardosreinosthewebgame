const BOSS_DAMAGE_TABLE = [20, 30, 40, 50];

const BOSSES = [
  { name: "Azhor", type: "Abissal", image: "assets/boss/azhor.png" },
  { name: "Kelmora", type: "Dracônico", image: "assets/boss/kelmora.png" },
  { name: "Zyra", type: "Arcano", image: "assets/boss/zyra.png" },
  { name: "Morgrin", type: "Sombrio", image: "assets/boss/morgrin.png" },
  { name: "Kael Vorn", type: "Titânico", image: "assets/boss/kael-vorn.png" },
  { name: "Nyx", type: "Fantasma", image: "assets/boss/nyx.png" },
  { name: "Ragnarok", type: "Golem", image: "assets/boss/ragnarok.png" },
  { name: "Vestra", type: "Infernal", image: "assets/boss/vestra.png" },
  { name: "Dravik", type: "Feral", image: "assets/boss/dravik.png" },
  { name: "Lumen Rex", type: "Celestial", image: "assets/boss/lumen-rex.png" },
];

function createBossAttacks() {
  return [
    { id: 1, name: "Golpe I", damage: BOSS_DAMAGE_TABLE[0] },
    { id: 2, name: "Golpe II", damage: BOSS_DAMAGE_TABLE[1] },
    { id: 3, name: "Golpe III", damage: BOSS_DAMAGE_TABLE[2] },
    { id: 4, name: "Golpe IV", damage: BOSS_DAMAGE_TABLE[3] },
  ];
}

export function shouldSpawnBoss(round) {
  return round > 0 && round % 5 === 0;
}

export function getBossForRound(round) {
  return BOSSES[(Math.floor(round / 5) - 1) % BOSSES.length];
}

export function resolveBossTurn(players, chooser, round) {
  const boss = getBossForRound(round);
  const attacks = createBossAttacks();
  const selected = chooser(attacks);
  const attack = attacks.find((a) => a.id === selected) ?? attacks[0];

  const logs = [`⚠️ Boss ${boss.name} (${boss.type}) apareceu!`];
  for (const player of players.filter((p) => p.alive)) {
    player.hp = Math.max(0, player.hp - attack.damage);
    if (player.hp === 0) player.alive = false;
    logs.push(`${boss.name} usou ${attack.name} e causou ${attack.damage} em ${player.name}.`);
  }

  return { boss, attacks, logs };
}
