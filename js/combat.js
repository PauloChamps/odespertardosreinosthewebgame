import { hasAdvantage } from "./cards.js";

export function chooseAttackType(character) {
  if (character.cooldowns.GPLUS === 0) return "GPLUS";
  if (character.cooldowns.G2 === 0) return "G2";
  return "G1";
}

export function tickCooldowns(character) {
  if (character.cooldowns.G2 > 0) character.cooldowns.G2 -= 1;
  if (character.cooldowns.GPLUS > 0) character.cooldowns.GPLUS -= 1;
}

export function applyCharacterAttack({ attacker, attackerCard, defender, targetCard }) {
  const attackType = chooseAttackType(attackerCard);
  let damage = attackerCard.attacks[attackType];

  if (targetCard && hasAdvantage(attackerCard.faction, targetCard.faction)) {
    damage += 5;
  }

  if (attackType === "G2") attackerCard.cooldowns.G2 = 1;
  if (attackType === "GPLUS") attackerCard.cooldowns.GPLUS = 1;

  if (targetCard) {
    targetCard.tempHp = (targetCard.tempHp ?? 260) - damage;
    if (targetCard.tempHp <= 0) {
      const idx = defender.characterSlots.findIndex((c) => c?.id === targetCard.id);
      if (idx >= 0) defender.characterSlots[idx] = null;
      return { attackType, damage, target: "character", defeated: true };
    }
    return { attackType, damage, target: "character", defeated: false };
  }

  defender.hp = Math.max(0, defender.hp - damage);
  if (defender.hp === 0) defender.alive = false;
  return { attackType, damage, target: "player", defeated: !defender.alive };
}

export function applyMagic(card, player, opponents) {
  if (card.effect === "heal") {
    player.hp = Math.min(3000, player.hp + card.power);
    return `${player.name} curou ${card.power} HP com ${card.name}.`;
  }

  const aliveOpponents = opponents.filter((o) => o.alive);
  if (aliveOpponents.length === 0) return `${card.name} sem alvo.`;

  const target = aliveOpponents[Math.floor(Math.random() * aliveOpponents.length)];
  if (card.effect === "damage") {
    target.hp = Math.max(0, target.hp - card.power);
    if (target.hp === 0) target.alive = false;
    return `${player.name} causou ${card.power} em ${target.name} com ${card.name}.`;
  }

  // buff
  const char = player.characterSlots.find(Boolean);
  if (char) {
    char.attacks.G1 += 30;
    char.attacks.G2 += 30;
    char.attacks.GPLUS += 30;
    return `${player.name} fortaleceu ${char.name} com ${card.name}.`;
  }

  return `${card.name} não teve efeito (sem personagem).`;
}
