import { hasAdvantage } from "./cards.js";

/**
 * Controla se o ataque especial pode ser usado nesta rodada.
 * G2 e G+ têm recarga e só podem ser usados a cada 2 rodadas do dono.
 */
export function canUseAttack(character, attackType) {
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

export function applyCharacterAttack({ attackerCard, attackType, defender, targetType, targetSlotIndex }) {
  let damage = attackerCard.attacks[attackType];

  if (attackType === "G2") attackerCard.cooldowns.G2 = 2;
  if (attackType === "GPLUS") attackerCard.cooldowns.GPLUS = 2;

  if (targetType === "character") {
    const targetCard = defender.characterSlots[targetSlotIndex];
    if (!targetCard) {
      return { ok: false, message: "Alvo inválido." };
    }

    if (hasAdvantage(attackerCard.faction, targetCard.faction)) damage += 5;

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
 * Sistema de magias baseado em tipo/valor/alvo.
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
    target.attacks.G1 += card.value;
    target.attacks.G2 += card.value;
    target.attacks.GPLUS += card.value;
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

  return "Magia sem efeito.";
}
