export const FACTIONS = ["HU", "HB", "EL", "MO"];

export const ADVANTAGE_TABLE = {
  HU: ["EL", "MO"],
  HB: ["EL", "MO"],
  EL: ["HB", "HU"],
  MO: ["HB", "HU"],
};

const characterTemplates = [
  { name: "Sentinela de Ferro", attacks: ["G1", "G2", "GPLUS"] },
  { name: "Arqueiro da Névoa", attacks: ["G1", "G2"] },
  { name: "Guardião Rubro", attacks: ["G1", "GPLUS"] },
  { name: "Maga dos Véus", attacks: ["G1", "G2", "GPLUS"] },
  { name: "Lâmina Aurora", attacks: ["G1", "G2"] },
  { name: "Bastião Lunar", attacks: ["G1", "GPLUS"] },
  { name: "Caçadora de Runas", attacks: ["G1", "G2", "GPLUS"] },
  { name: "Monge Tempestuoso", attacks: ["G1", "G2"] },
];

const magicCards = [
  { name: "Ritual de Vida", effectType: "cura_personagem", value: 8, target: "ally_character" },
  { name: "Runa de Guerra", effectType: "buff_ataque", value: 10, target: "ally_character" },
  { name: "Seta Arcana", effectType: "dano_inimigo", value: 10, target: "enemy_character" },
  { name: "Escudo Rúnico", effectType: "escudo_personagem", value: 8, target: "ally_character" },
  { name: "Quebra-Guarda", effectType: "debuff_inimigo", value: 6, target: "enemy_character" },
  { name: "Chamado Vital", effectType: "cura_jogador", value: 15, target: "ally_player" },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createCharacterCard(id) {
  const faction = pick(FACTIONS);
  const template = pick(characterTemplates);
  const baseAttack = 18 + Math.floor(Math.random() * 8);

  const attacks = { G1: baseAttack };
  if (template.attacks.includes("G2")) attacks.G2 = baseAttack + 8;
  if (template.attacks.includes("GPLUS")) attacks.GPLUS = baseAttack + 12;

  return {
    id,
    type: "character",
    name: template.name,
    faction,
    hp: 60,
    attack: baseAttack,
    image: `assets/cards/character_${id}.png`,
    attacks,
    cooldowns: { G2: 0, GPLUS: 0 },
    shield: 0,
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
