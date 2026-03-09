export const FACTIONS = ["HU", "HB", "EL", "MO"];

export const ADVANTAGE_TABLE = {
  HU: ["EL", "MO"],
  HB: ["EL", "MO"],
  EL: ["HB", "HU"],
  MO: ["HB", "HU"],
};

/**
 * Catálogo fixo de personagens para facilitar a edição de nome, foto e golpes.
 * Você pode trocar o `image` por arquivos reais em assets/cards/characters/.
 */
export const CHARACTER_CATALOG = [
  {
    key: "sentinela-ferro",
    name: "Sentinela de Ferro",
    image: "assets/cards/characters/sentinela-ferro.svg",
    baseHp: 62,
    moves: [
      { code: "G1", name: "Lança de Aço", power: 19 },
      { code: "G2", name: "Escudo Impactante", power: 27 },
      { code: "GPLUS", name: "Investida de Titânio", power: 32 },
    ],
  },
  {
    key: "arqueiro-nevoa",
    name: "Arqueiro da Névoa",
    image: "assets/cards/characters/arqueiro-nevoa.svg",
    baseHp: 56,
    moves: [
      { code: "G1", name: "Flecha Fria", power: 21 },
      { code: "G2", name: "Rajada Nebulosa", power: 29 },
    ],
  },
  {
    key: "guardiao-rubro",
    name: "Guardião Rubro",
    image: "assets/cards/characters/guardiao-rubro.svg",
    baseHp: 64,
    moves: [
      { code: "G1", name: "Golpe Carmesim", power: 18 },
      { code: "GPLUS", name: "Fúria Rubra", power: 33 },
    ],
  },
  {
    key: "maga-veus",
    name: "Maga dos Véus",
    image: "assets/cards/characters/maga-veus.svg",
    baseHp: 55,
    moves: [
      { code: "G1", name: "Raio Arcano", power: 20 },
      { code: "G2", name: "Orbe Místico", power: 27 },
      { code: "GPLUS", name: "Ruptura Etérea", power: 31 },
    ],
  },
  {
    key: "lamina-aurora",
    name: "Lâmina Aurora",
    image: "assets/cards/characters/lamina-aurora.svg",
    baseHp: 58,
    moves: [
      { code: "G1", name: "Corte de Luz", power: 22 },
      { code: "G2", name: "Passo Alvorecer", power: 28 },
    ],
  },
  {
    key: "bastiao-lunar",
    name: "Bastião Lunar",
    image: "assets/cards/characters/bastiao-lunar.svg",
    baseHp: 66,
    moves: [
      { code: "G1", name: "Muralha Lunar", power: 17 },
      { code: "GPLUS", name: "Queda da Lua", power: 34 },
    ],
  },
  {
    key: "cacadora-runas",
    name: "Caçadora de Runas",
    image: "assets/cards/characters/cacadora-runas.svg",
    baseHp: 57,
    moves: [
      { code: "G1", name: "Marca Rúnica", power: 20 },
      { code: "G2", name: "Dardo Rúnico", power: 27 },
      { code: "GPLUS", name: "Tempestade de Runas", power: 32 },
    ],
  },
  {
    key: "monge-tempestuoso",
    name: "Monge Tempestuoso",
    image: "assets/cards/characters/monge-tempestuoso.svg",
    baseHp: 59,
    moves: [
      { code: "G1", name: "Punho do Trovão", power: 21 },
      { code: "G2", name: "Descarga Celeste", power: 29 },
    ],
  },
];

const magicCards = [
  { name: "Ritual de Vida", effectType: "cura_personagem", value: 8, target: "ally_character", image: "assets/cards/magic_ritual-vida.svg" },
  { name: "Runa de Guerra", effectType: "buff_ataque", value: 10, target: "ally_character", image: "assets/cards/magic_runa-guerra.svg" },
  { name: "Seta Arcana", effectType: "dano_inimigo", value: 10, target: "enemy_character", image: "assets/cards/magic_seta-arcana.svg" },
  { name: "Escudo Rúnico", effectType: "escudo_personagem", value: 8, target: "ally_character", image: "assets/cards/magic_escudo-runico.svg" },
  { name: "Quebra-Guarda", effectType: "debuff_inimigo", value: 6, target: "enemy_character", image: "assets/cards/magic_quebra-guarda.svg" },
  { name: "Chamado Vital", effectType: "cura_jogador", value: 15, target: "ally_player", image: "assets/cards/magic_chamado-vital.svg" },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createCharacterCard(id) {
  const faction = pick(FACTIONS);
  const catalog = pick(CHARACTER_CATALOG);

  const attacks = {};
  for (const move of catalog.moves) attacks[move.code] = move.power;

  return {
    id,
    type: "character",
    name: catalog.name,
    faction,
    hp: catalog.baseHp,
    attack: attacks.G1 ?? 0,
    image: catalog.image,
    moveNames: Object.fromEntries(catalog.moves.map((m) => [m.code, m.name])),
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
    image: preset.image,
    effectType: preset.effectType,
    value: preset.value,
    target: preset.target,
  };
}

export function hasAdvantage(attackerFaction, defenderFaction) {
  return ADVANTAGE_TABLE[attackerFaction]?.includes(defenderFaction) ?? false;
}
