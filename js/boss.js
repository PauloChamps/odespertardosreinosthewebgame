const BOSSES = [
  {
    name: "Azhor",
    type: "Abissal",
    image: "assets/boss/azhor.png",
    attacks: [
      { id: 1, name: "Mordida do Vazio", damage: 20 },
      { id: 2, name: "Pulso Sombrio", damage: 30 },
      { id: 3, name: "Fenda Abissal", damage: 40 },
      { id: 4, name: "Colapso Final", damage: 50 },
    ],
  },
  {
    name: "Kelmora",
    type: "Dracônico",
    image: "assets/boss/kelmora.png",
    attacks: [
      { id: 1, name: "Sopro Quente", damage: 20 },
      { id: 2, name: "Garra Dupla", damage: 30 },
      { id: 3, name: "Rugido de Cinzas", damage: 40 },
      { id: 4, name: "Queda Vulcânica", damage: 50 },
    ],
  },
  { name: "Zyra", type: "Arcano", image: "assets/boss/zyra.png", attacks: [
      { id: 1, name: "Faísca Rúnica", damage: 20 }, { id: 2, name: "Explosão Prismática", damage: 30 },
      { id: 3, name: "Anel Místico", damage: 40 }, { id: 4, name: "Cometa Arcano", damage: 50 },
  ]},
  { name: "Morgrin", type: "Sombrio", image: "assets/boss/morgrin.png", attacks: [
      { id: 1, name: "Sombra Cortante", damage: 20 }, { id: 2, name: "Noite Profunda", damage: 30 },
      { id: 3, name: "Espiral Negra", damage: 40 }, { id: 4, name: "Silêncio Mortal", damage: 50 },
  ]},
  { name: "Kael Vorn", type: "Titânico", image: "assets/boss/kael-vorn.png", attacks: [
      { id: 1, name: "Pisão Pesado", damage: 20 }, { id: 2, name: "Impacto Rochoso", damage: 30 },
      { id: 3, name: "Punho Colossal", damage: 40 }, { id: 4, name: "Esmagamento Total", damage: 50 },
  ]},
  { name: "Nyx", type: "Fantasma", image: "assets/boss/nyx.png", attacks: [
      { id: 1, name: "Sussurro Frio", damage: 20 }, { id: 2, name: "Névoa Pálida", damage: 30 },
      { id: 3, name: "Lamento Eterno", damage: 40 }, { id: 4, name: "Abraço do Além", damage: 50 },
  ]},
  { name: "Ragnarok", type: "Golem", image: "assets/boss/ragnarok.png", attacks: [
      { id: 1, name: "Estilhaço", damage: 20 }, { id: 2, name: "Martelo de Pedra", damage: 30 },
      { id: 3, name: "Avalanche", damage: 40 }, { id: 4, name: "Ruptura Sísmica", damage: 50 },
  ]},
  { name: "Vestra", type: "Infernal", image: "assets/boss/vestra.png", attacks: [
      { id: 1, name: "Brasa Viva", damage: 20 }, { id: 2, name: "Corrente Rubra", damage: 30 },
      { id: 3, name: "Lança Ígnea", damage: 40 }, { id: 4, name: "Inferno Aberto", damage: 50 },
  ]},
  { name: "Dravik", type: "Feral", image: "assets/boss/dravik.png", attacks: [
      { id: 1, name: "Investida", damage: 20 }, { id: 2, name: "Mordida Selvagem", damage: 30 },
      { id: 3, name: "Rasgo Brutal", damage: 40 }, { id: 4, name: "Fúria Predatória", damage: 50 },
  ]},
  { name: "Lumen Rex", type: "Celestial", image: "assets/boss/lumen-rex.png", attacks: [
      { id: 1, name: "Raio Alvo", damage: 20 }, { id: 2, name: "Pulso Solar", damage: 30 },
      { id: 3, name: "Chama Celeste", damage: 40 }, { id: 4, name: "Julgamento Divino", damage: 50 },
  ]},
];

export function shouldSpawnBoss(round) {
  return round > 0 && round % 5 === 0;
}

export function getBossForRound(round) {
  return BOSSES[(Math.floor(round / 5) - 1) % BOSSES.length];
}

export function resolveBossTurn(players, chooser, round) {
  const boss = getBossForRound(round);
  const selected = chooser(boss.attacks);
  const attack = boss.attacks.find((a) => a.id === selected) ?? boss.attacks[0];

  const logs = [`⚠️ Boss ${boss.name} (${boss.type}) apareceu!`];
  for (const player of players.filter((p) => p.alive)) {
    player.hp = Math.max(0, player.hp - attack.damage);
    if (player.hp === 0) player.alive = false;
    logs.push(`${boss.name} usou ${attack.name} e causou ${attack.damage} em ${player.name}.`);
  }

  return { boss, logs };
}
