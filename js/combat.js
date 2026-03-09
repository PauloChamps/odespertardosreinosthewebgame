import { hasAdvantage } from "./cards.js";

/** Regras de disponibilidade de golpes por carta. */
export function canUseAttack(character, attackType) {
  if (!character.attacks[attackType]) return false;
  if (attackType === "G1") return true;
  if (attackType === "G2") return character.cooldowns.G2 === 0;
  if (attackType === "GPLUS") return character.cooldowns.GPLUS === 0;
  return false;
}

export function startTurnCooldownTick(player) {
  for (const card of player.characterSlots.filter(Boolean)) {
    if (card.cooldowns.G2 > 0) card.cooldowns.G2 -= 1;
    if (card.cooldowns.GPLUS > 0) card.cooldowns.GPLUS -= 1;
  }
}

function absorbShield(targetCard, damage) {
  if (!targetCard || targetCard.shield <= 0) return damage;
  const blocked = Math.min(targetCard.shield, damage);
  targetCard.shield -= blocked;
  return damage - blocked;
}

export function applyCharacterAttack({ attackerCard, attackType, defender, targetType, targetSlotIndex }) {
  let damage = attackerCard.attacks[attackType] ?? 0;

  if (attackType === "G2") attackerCard.cooldowns.G2 = 2;
  if (attackType === "GPLUS") attackerCard.cooldowns.GPLUS = 2;

  if (targetType === "character") {
    const targetCard = defender.characterSlots[targetSlotIndex];
    if (!targetCard) return { ok: false, message: "Alvo inválido." };

    if (hasAdvantage(attackerCard.faction, targetCard.faction)) damage += 5;
    damage = absorbShield(targetCard, damage);

    targetCard.hp -= damage;
    if (targetCard.hp <= 0) {
      defender.characterSlots[targetSlotIndex] = null;
      return { ok: true, damage, targetType, defeated: true };
    }
    return { ok: true, damage, targetType, defeated: false };
  }

  defender.hp = Math.max(0, defender.hp - damage);
  if (defender.hp === 0) defender.alive = false;
  return { ok: true, damage, targetType: "player", defeated: !defender.alive };
}

/**
 * Magias com funcionalidades próprias.
 * Após uso, o card deve ir para o cemitério (tratado em game.js).
 */
export function applyMagicEffect(card, caster, allies, enemies, targetInfo) {
  if (card.effectType === "cura_personagem") {
    const target = allies[targetInfo.playerIndex]?.characterSlots[targetInfo.slotIndex];
    if (!target) return "Magia falhou: sem personagem aliado no alvo.";
    target.hp += card.value;
    return `${caster.name} curou ${target.name} em +${card.value} HP.`;
  }

  if (card.effectType === "buff_ataque") {
    const target = allies[targetInfo.playerIndex]?.characterSlots[targetInfo.slotIndex];
    if (!target) return "Magia falhou: sem personagem aliado no alvo.";
    target.attack += card.value;
    target.attacks.G1 = (target.attacks.G1 ?? 0) + card.value;
    if (target.attacks.G2) target.attacks.G2 += card.value;
    if (target.attacks.GPLUS) target.attacks.GPLUS += card.value;
    return `${caster.name} aumentou o ataque de ${target.name} em +${card.value}.`;
  }

  if (card.effectType === "dano_inimigo") {
    const enemy = enemies[targetInfo.playerIndex];
    const target = enemy?.characterSlots[targetInfo.slotIndex];
    if (!target) return "Magia falhou: sem personagem inimigo no alvo.";
    target.hp -= card.value;
    if (target.hp <= 0) enemy.characterSlots[targetInfo.slotIndex] = null;
    return `${caster.name} causou ${card.value} de dano mágico em ${target.name}.`;
  }

  if (card.effectType === "escudo_personagem") {
    const target = allies[targetInfo.playerIndex]?.characterSlots[targetInfo.slotIndex];
    if (!target) return "Magia falhou: sem personagem aliado no alvo.";
    target.shield = (target.shield ?? 0) + card.value;
    return `${caster.name} concedeu escudo ${card.value} para ${target.name}.`;
  }

  if (card.effectType === "debuff_inimigo") {
    const enemy = enemies[targetInfo.playerIndex];
    const target = enemy?.characterSlots[targetInfo.slotIndex];
    if (!target) return "Magia falhou: sem personagem inimigo no alvo.";
    target.attacks.G1 = Math.max(1, target.attacks.G1 - card.value);
    if (target.attacks.G2) target.attacks.G2 = Math.max(1, target.attacks.G2 - card.value);
    if (target.attacks.GPLUS) target.attacks.GPLUS = Math.max(1, target.attacks.GPLUS - card.value);
    return `${caster.name} enfraqueceu ${target.name} em ${card.value} ATK.`;
  }

  if (card.effectType === "cura_jogador") {
    caster.hp = Math.min(3000, caster.hp + card.value);
    return `${caster.name} recuperou ${card.value} HP.`;
  }

  return "Magia sem efeito.";
}
