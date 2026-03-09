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

const magicCards = [
  { name: "Ritual de Vida", effectType: "cura_personagem", value: 5, target: "ally_character" },
  { name: "Runa de Guerra", effectType: "buff_ataque", value: 10, target: "ally_character" },
  { name: "Seta Arcana", effectType: "dano_inimigo", value: 10, target: "enemy_character" },
  { name: "Manto Regenerador", effectType: "cura_personagem", value: 5, target: "ally_character" },
  { name: "Cântico da Lâmina", effectType: "buff_ataque", value: 10, target: "ally_character" },
  { name: "Orbe Rachado", effectType: "dano_inimigo", value: 10, target: "enemy_character" },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createCharacterCard(id) {
  const faction = pick(FACTIONS);
  const baseAttack = 18 + Math.floor(Math.random() * 8);
  return {
    id,
    type: "character",
    name: pick(characterNames),
    faction,
    hp: 60,
    attack: baseAttack,
    image: `assets/cards/character_${id}.png`,
    attacks: {
      G1: baseAttack,
      G2: baseAttack + 8,
      GPLUS: baseAttack + 12,
    },
    cooldowns: { G2: 0, GPLUS: 0 },
  };
}

export function createMagicCard(id) {
  const preset = pick(magicCards);
  return {
    id,
    type: "magic",
    name: preset.name,
    faction: pick(FACTIONS),
    hp: 0,
    attack: 0,
    image: `assets/cards/magic_${id}.png`,
    effectType: preset.effectType,
    value: preset.value,
    target: preset.target,
  };
}

export function hasAdvantage(attackerFaction, defenderFaction) {
  return ADVANTAGE_TABLE[attackerFaction]?.includes(defenderFaction) ?? false;
}
