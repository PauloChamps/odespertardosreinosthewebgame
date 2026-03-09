export const FACTIONS = ["HU", "HB", "EL", "MO"];

export const ADVANTAGE_TABLE = {
  HU: ["EL", "MO"],
  HB: ["EL", "MO"],
  EL: ["HB", "HU"],
  MO: ["HB", "HU"],
};

const characterNames = [
  "Sentinela de Ferro",
  "Arqueiro da Névoa",
  "Guardião Rubro",
  "Maga dos Véus",
  "Lâmina Aurora",
  "Bastião Lunar",
  "Caçadora de Runas",
  "Monge Tempestuoso",
];

const magicNames = [
  "Escudo Arcano",
  "Fúria Elemental",
  "Ritual de Cura",
  "Vórtice Sombrio",
  "Chamado do Eclipse",
  "Bênção Real",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createCharacterCard(id) {
  const faction = pick(FACTIONS);
  return {
    id,
    type: "character",
    name: pick(characterNames),
    faction,
    attacks: {
      G1: 180 + Math.floor(Math.random() * 70),
      G2: 250 + Math.floor(Math.random() * 80),
      GPLUS: 320 + Math.floor(Math.random() * 90),
    },
    cooldowns: { G2: 0, GPLUS: 0 },
  };
}

export function createMagicCard(id) {
  const effects = ["buff", "damage", "heal"];
  return {
    id,
    type: "magic",
    name: pick(magicNames),
    effect: pick(effects),
    power: 120 + Math.floor(Math.random() * 90),
    faction: pick(FACTIONS),
  };
}

export function hasAdvantage(attackerFaction, defenderFaction) {
  return ADVANTAGE_TABLE[attackerFaction]?.includes(defenderFaction) ?? false;
}
