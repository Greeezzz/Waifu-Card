import { BUFF_TYPES, DEBUFF_TYPES, ULTIMATE_TYPES } from '../data/cards';

export class BattleSystem {
  static calculateDamage(attacker, defender, isSkillAttack = false) {
    let baseDamage = attacker.atk;
    let logMsg = `[FIGHT] ${attacker.name} attacks ${defender.name}`;
    // Apply penetration buff
    if (attacker.buffs.includes(BUFF_TYPES.PENETRATION)) {
      baseDamage += Math.floor(baseDamage * 0.3); // 30% more damage
      logMsg += ` (Penetration buff active!)`;
    }
    // Random damage variance (90-110%)
    const variance = 0.9 + Math.random() * 0.2;
    let finalDamage = Math.floor(baseDamage * variance);
    // Store damage received for berserk mode tracking
    const originalDefenderHP = defender.hp;
    // Apply to shield first, then HP
    if (defender.shield > 0) {
      const shieldDamage = Math.floor(finalDamage * 1.4);
      const shieldRemaining = Math.max(0, defender.shield - shieldDamage);
      const overflow = Math.max(0, shieldDamage - defender.shield);
      defender.shield = shieldRemaining;
      if (overflow > 0) {
        defender.hp = Math.max(0, defender.hp - overflow);
        logMsg += ` | ${defender.name}'s shield breaks! Overflow damage: ${overflow}`;
      } else {
        logMsg += ` | ${defender.name} absorbs ${shieldDamage} damage with shield.`;
      }
    } else {
      defender.hp = Math.max(0, defender.hp - finalDamage);
      logMsg += ` | ${defender.name} takes ${finalDamage} damage.`;
    }
    // Track damage for berserk mode (only actual HP damage)
    const actualDamage = originalDefenderHP - defender.hp;
    if (defender.berserkMode && actualDamage > 0) {
      defender.lastDamageReceived = (defender.lastDamageReceived || 0) + actualDamage;
    }
    // Add energy based on damage dealt (BOOSTED: more energy gain)
    const energyFromDamage = Math.floor(finalDamage / 1.2);
    logMsg += ` | ${attacker.name} gains ${energyFromDamage} energy.`;
    attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + energyFromDamage);
    // Defender gets energy when taking damage (BOOSTED)
    const defenderEnergyGain = Math.floor(actualDamage / 3);
    logMsg += ` | ${defender.name} gains ${defenderEnergyGain} energy.`;
    defender.energy = Math.min(defender.maxEnergy, defender.energy + defenderEnergyGain);
    console.log(logMsg);
    return finalDamage;
  }
  
  static applySkill(caster, target, skillType, team = null) {
    let energyGain = 0;
    let result = "";
    let logMsg = `[FIGHT] ${caster.name} uses skill on ${target.name}`;
    switch(skillType) {
      case BUFF_TYPES.SHIELD:
        const shieldAmount = Math.floor(caster.atk * 1.5);
        target.shield += shieldAmount;
        target.buffs = [...(target.buffs || []), BUFF_TYPES.SHIELD];
        energyGain = 30;
        result = `${target.name} gained ${shieldAmount} shield!`;
        logMsg += ` | ${target.name} gains ${shieldAmount} shield.`;
        break;
      case BUFF_TYPES.HEAL:
        const healAmount = Math.floor(caster.atk * 1.2);
        target.hp = Math.min(target.maxHp, target.hp + healAmount);
        energyGain = 35;
        result = `${target.name} healed for ${healAmount} HP!`;
        logMsg += ` | ${target.name} heals for ${healAmount} HP.`;
        break;
      case BUFF_TYPES.PENETRATION:
        target.buffs = [...(target.buffs || []), BUFF_TYPES.PENETRATION];
        energyGain = 25;
        result = `${target.name} gained penetration buff!`;
        logMsg += ` | ${target.name} gains penetration buff.`;
        break;
      case DEBUFF_TYPES.POISON:
        const poisonDamage = Math.floor(target.maxHp * 0.05);
        target.debuffs = [...(target.debuffs || []), {
          type: DEBUFF_TYPES.POISON,
          damage: poisonDamage,
          duration: 3
        }];
        energyGain = 40;
        result = `${target.name} is poisoned!`;
        logMsg += ` | ${target.name} is poisoned (${poisonDamage} per turn).`;
        break;
      case DEBUFF_TYPES.BLEEDING:
        target.debuffs = [...(target.debuffs || []), {
          type: DEBUFF_TYPES.BLEEDING,
          damage: 10,
          duration: 4
        }];
        energyGain = 35;
        result = `${target.name} is bleeding!`;
        logMsg += ` | ${target.name} is bleeding (10 per turn).`;
        break;
      case DEBUFF_TYPES.STUN:
        target.isStunned = true;
        target.debuffs = [...(target.debuffs || []), {
          type: DEBUFF_TYPES.STUN,
          duration: 1
        }];
        energyGain = 45;
        result = `${target.name} is stunned!`;
        logMsg += ` | ${target.name} is stunned.`;
        break;
      case DEBUFF_TYPES.BREAK:
        target.debuffs = [...(target.debuffs || []), {
          type: DEBUFF_TYPES.BREAK,
          value: 30,
          duration: 2
        }];
        energyGain = 40;
        result = `${target.name} armor break! -30 armor for 2 turns!`;
        logMsg += ` | ${target.name} armor break (-30 armor, 2 turns).`;
        break;
      default:
        result = "Unknown skill!";
        logMsg += ` | Unknown skill.`;
    }
    logMsg += ` | ${caster.name} gains ${energyGain} energy.`;
    caster.energy = Math.min(caster.maxEnergy, caster.energy + energyGain);
    console.log(logMsg);
    return result;
  }
  
  static applyUltimate(caster, target, ultimateType, playerTeam, karbitTeam) {
  switch(ultimateType) {
    case ULTIMATE_TYPES.BETH_BURST:
      if (!target || target.hp <= 0) {
        return `❌ ${caster.name} cannot use Burst Shot - no valid target!`;
      }
      const burstDamage = Math.floor(caster.atk * 2.5);
      target.hp = Math.max(0, target.hp - burstDamage);
      caster.energy = 0;
      return `💥 ${caster.name} fires Burst Shot! ${target.name} takes ${burstDamage} damage!`;
    case ULTIMATE_TYPES.BOMB:
      if (target && target.hp !== undefined) {
        target.hp = 0;
        caster.hp = 0;
        caster.energy = 0;
        return `💥 ${caster.name} are explosion! Both ${caster.name} and ${target.name} are eliminated!`;
      } else {
        caster.hp = 0;
        caster.energy = 0;
        return `💥 ${caster.name} explodes but misses the target!`;
      }
    case ULTIMATE_TYPES.METEOR:
      {
        const meteorEnemies = caster.team === 'player' ? karbitTeam : playerTeam;
        const meteorAllies = caster.team === 'player' ? playerTeam : karbitTeam;
        let meteorDamage = 0;
        meteorEnemies.forEach(enemy => {
          if (enemy.hp > 0) {
            const damage = Math.floor(caster.atk * 1.5);
            enemy.hp = Math.max(0, enemy.hp - damage);
            meteorDamage += damage;
          }
        });
        meteorAllies.forEach(ally => {
          if (ally.hp > 0) {
            ally.shield += Math.floor(caster.atk * 0.8);
          }
        });
        caster.energy = 0;
        return `🌙 ${caster.name} summons Ice Meteor! All enemies take damage, allies gain shield!`;
      }
    case ULTIMATE_TYPES.RESURRECTION:
      {
        const allies = caster.team === 'player' ? playerTeam : karbitTeam;
        let revived = 0;
        allies.forEach(ally => {
          if (ally.hp <= 0) {
            ally.hp = Math.floor(ally.maxHp * 0.5);
            revived++;
          }
        });
        caster.energy = 0;
        return `🌸 ${caster.name} uses Medical Ninjutsu! ${revived} allies revived with 50% HP!`;
      }
    case ULTIMATE_TYPES.TIMESTOP:
      {
        const domainAllies = caster.team === 'player' ? playerTeam : karbitTeam;
        domainAllies.forEach(ally => {
          if (ally.hp > 0) {
            ally.hp = Math.min(ally.maxHp, ally.hp + Math.floor(caster.atk * 1.5));
            ally.energy = Math.min(ally.maxEnergy, ally.energy + 30);
          }
        });
        caster.energy = 0;
        return `⏰ ${caster.name} creates Healing Domain! All allies healed and gain energy!`;
      }
    case ULTIMATE_TYPES.PLAGUE:
      {
        const plagueTargets = caster.team === 'player' ? karbitTeam : playerTeam;
        const plagueAllies = caster.team === 'player' ? playerTeam : karbitTeam;
        let totalPlagueDamage = 0;
        plagueTargets.forEach(enemy => {
          if (enemy.hp > 0) {
            const damage = Math.floor(caster.atk * 1.4);
            enemy.hp = Math.max(0, enemy.hp - damage);
            totalPlagueDamage += damage;
          }
        });
        const healAmount = Math.floor(totalPlagueDamage / plagueAllies.length);
        plagueAllies.forEach(ally => {
          if (ally.hp > 0) {
            ally.hp = Math.min(ally.maxHp, ally.hp + healAmount);
          }
        });
        caster.energy = 0;
        return `� ${caster.name} summons Spirit Butterflies! Damages enemies and heals allies!`;
      }
    case ULTIMATE_TYPES.NUKE:
      {
        const nukeTargets = caster.team === 'player' ? karbitTeam : playerTeam;
        nukeTargets.forEach(enemy => {
          if (enemy.hp > 0) {
            const damage = Math.floor(caster.atk * 1.8);
            enemy.hp = Math.max(0, enemy.hp - damage);
            if (Math.random() < 0.6) {
              enemy.isStunned = true;
              enemy.debuffs = [...(enemy.debuffs || []), {
                type: DEBUFF_TYPES.STUN,
                duration: 1
              }];
            }
          }
        });
        caster.energy = 0;
        return `💀 ${caster.name} unleashes Overwhelming Force! AOE damage with stun chance!`;
      }
    case ULTIMATE_TYPES.FORTRESS:
      {
        const team = caster.team === 'player' ? playerTeam : karbitTeam;
        team.forEach(ally => {
          if (ally.hp > 0) {
            ally.shield += Math.floor(caster.atk);
            ally.hp = Math.min(ally.maxHp, ally.hp + Math.floor(caster.atk * 0.8));
          }
        });
        caster.energy = 0;
        return `🛡️ ${caster.name} creates protective barrier! All allies gain shield and healing!`;
      }
    case ULTIMATE_TYPES.EXECUTION:
      {
        const inspiredAllies = caster.team === 'player' ? playerTeam : karbitTeam;
        inspiredAllies.forEach(ally => {
          if (ally.hp > 0) {
            ally.buffs = [...(ally.buffs || []), BUFF_TYPES.PENETRATION];
            ally.energy = Math.min(ally.maxEnergy, ally.energy + 40);
          }
        });
        caster.energy = 0;
        return `🏹 ${caster.name} inspires the team! All allies gain 50% penetration and energy!`;
      }
    case ULTIMATE_TYPES.BERSERK:
      // Zani: burst musuh, buff penetration ke tim sendiri, debuff break ke musuh
      if (!target || target.hp <= 0) {
        return `❌ ${caster.name} cannot use Berserk - no valid target!`;
      }
      // Burst damage ke musuh
      const burst = Math.floor(caster.atk * 2.2);
      target.hp = Math.max(0, target.hp - burst);
      // Buff penetration ke tim sendiri
      const zaniTeam = caster.team === 'player' ? playerTeam : karbitTeam;
      zaniTeam.forEach(ally => {
        if (ally.hp > 0) {
          ally.buffs = [...(ally.buffs || []), BUFF_TYPES.PENETRATION];
        }
      });
      // Debuff break ke musuh
      target.debuffs = [...(target.debuffs || []), {
        type: DEBUFF_TYPES.BREAK,
        value: 30,
        duration: 2
      }];
      caster.energy = 0;
      return `💥 ${caster.name} unleashes Berserk! ${target.name} takes ${burst} damage, team gains penetration, ${target.name} armor break!`;
    case ULTIMATE_TYPES.REVERSE_TIME:
      if (!target || target.hp <= 0) {
        return `❌ ${caster.name} cannot use Reverse Time - no valid target!`;
      }
      if (caster.lastDamageReceived > 0) {
        caster.hp = Math.min(caster.maxHp, caster.hp + caster.lastDamageReceived);
        const reverseDamage = caster.lastDamageReceived;
        target.hp = Math.max(0, target.hp - reverseDamage);
        caster.lastDamageReceived = 0;
        caster.energy = 0;
        return `🕰️ ${caster.name} reverses time! Damage reflected back to ${target.name}!`;
      } else {
        const damage = Math.floor(caster.atk * 2);
        target.hp = Math.max(0, target.hp - damage);
        caster.energy = 0;
        return `🕰️ ${caster.name} shoots temporal bullet! ${target.name} takes ${damage} damage!`;
      }
    case ULTIMATE_TYPES.DOMAIN:
      {
        const domainTeam = caster.team === 'player' ? playerTeam : karbitTeam;
        domainTeam.forEach(ally => {
          if (ally.hp > 0) {
            ally.hp = Math.min(ally.maxHp, ally.hp + Math.floor(caster.atk * 1.5));
            ally.energy = Math.min(ally.maxEnergy, ally.energy + 30);
          }
        });
        caster.energy = 0;
        return `🏛️ ${caster.name} creates Domain! All allies healed and gain energy!`;
      }
    case ULTIMATE_TYPES.INSPIRE:
      {
        const teamInspire = caster.team === 'player' ? playerTeam : karbitTeam;
        teamInspire.forEach(ally => {
          if (ally.hp > 0) {
            ally.buffs = [...(ally.buffs || []), BUFF_TYPES.PENETRATION];
            ally.energy = Math.min(ally.maxEnergy, ally.energy + 40);
          }
        });
        caster.energy = 0;
        return `✨ ${caster.name} inspires everyone! All allies gain penetration and energy!`;
      }
    case ULTIMATE_TYPES.SMILE:
      {
        const smileTargets = caster.team === 'player' ? karbitTeam : playerTeam;
        smileTargets.forEach(enemy => {
          if (enemy.hp > 0) {
            enemy.isStunned = true;
            enemy.debuffs = [...(enemy.debuffs || []), {
              type: DEBUFF_TYPES.STUN,
              duration: 2
            }];
          }
        });
        caster.energy = 0;
        return `😈 ${caster.name} shows a menacing smile! All enemies paralyzed with fear!`;
      }
    case ULTIMATE_TYPES.ANXIETY:
      {
        const anxietyEnemies = caster.team === 'player' ? karbitTeam : playerTeam;
        anxietyEnemies.forEach(enemy => {
          if (enemy.hp > 0) {
            const damage = Math.floor(caster.atk * 1.2);
            enemy.hp = Math.max(0, enemy.hp - damage);
            enemy.debuffs = [...(enemy.debuffs || []), {
              type: DEBUFF_TYPES.BLEEDING,
              damage: 15,
              duration: 3
            }];
          }
        });
        caster.energy = 0;
        return `😰 ${caster.name} spreads overwhelming anxiety! All enemies affected!`;
      }
    default:
      return `✨ ${caster.name} uses unknown ultimate!`;
  }
}

  
  static processDebuffs(card) {
    const messages = [];
    
    if (!card.debuffs) {
      card.debuffs = [];
      return messages;
    }
    
    // Process each debuff
    card.debuffs = card.debuffs.filter(debuff => {
      switch(debuff.type) {
        case DEBUFF_TYPES.POISON:
          // Poison ignores shield
          card.hp = Math.max(0, card.hp - debuff.damage);
          messages.push(`${card.name} takes ${debuff.damage} poison damage!`);
          break;
          
        case DEBUFF_TYPES.BLEEDING:
          // Bleeding affects shield first
          if (card.shield > 0) {
            const shieldDamage = Math.min(card.shield, debuff.damage);
            card.shield -= shieldDamage;
            const overflow = debuff.damage - shieldDamage;
            if (overflow > 0) {
              card.hp = Math.max(0, card.hp - overflow);
            }
          } else {
            card.hp = Math.max(0, card.hp - debuff.damage);
          }
          messages.push(`${card.name} takes ${debuff.damage} bleeding damage!`);
          break;
          
        case DEBUFF_TYPES.STUN:
          // Stun management - duration decreases, remove stun flag when expired
          if (debuff.duration <= 1) {
            card.isStunned = false;
            messages.push(`${card.name} recovers from stun!`);
          }
          break;
      }
      
      // Decrease duration and keep if > 0
      debuff.duration--;
      return debuff.duration > 0;
    });
    
    return messages;
  }
  
  static isTeamDefeated(team) {
    return team.every(card => card.hp <= 0);
  }
  
  static getAliveCards(team) {
    return team.filter(card => card.hp > 0);
  }
  
  static karbitAI(karbitTeam, playerTeam) {
    const aliveKarbitCards = this.getAliveCards(karbitTeam);
    const alivePlayerCards = this.getAliveCards(playerTeam);
    
    // Basic validation
    if (aliveKarbitCards.length === 0 || alivePlayerCards.length === 0) {
      console.log("No alive cards available");
      return null;
    }
    
    // Filter out stunned cards
    const availableKarbitCards = aliveKarbitCards.filter(card => !card.isStunned);
    
    if (availableKarbitCards.length === 0) {
      // All alive cards are stunned
      console.log("All AI cards are stunned");
      return null;
    }
    
    // Pick random available card
    const randomKarbitCard = availableKarbitCards[Math.floor(Math.random() * availableKarbitCards.length)];
    const randomPlayerCard = alivePlayerCards[Math.floor(Math.random() * alivePlayerCards.length)];
    
    console.log(`AI selected: ${randomKarbitCard.name} (Energy: ${randomKarbitCard.energy}/${randomKarbitCard.maxEnergy})`);
    
    // AI decision making with energy consideration
    const canUseUltimate = randomKarbitCard.energy >= randomKarbitCard.maxEnergy;
    const hasSkills = randomKarbitCard.skills && randomKarbitCard.skills.length > 0;
    
    // Priority: Ultimate > Skill > Attack
    if (canUseUltimate && Math.random() < 0.8) {
      // 80% chance to use ultimate when available
      console.log(`AI using ultimate: ${randomKarbitCard.ultimate.type}`);
      return {
        action: 'ultimate',
        caster: randomKarbitCard,
        target: randomPlayerCard,
        skill: randomKarbitCard.ultimate.type
      };
    } else if (hasSkills && Math.random() < 0.4) {
      // 40% chance to use skill
      const skill = randomKarbitCard.skills[Math.floor(Math.random() * randomKarbitCard.skills.length)];
      
      // Determine target based on skill type
      let target;
      if ([BUFF_TYPES.SHIELD, BUFF_TYPES.HEAL, BUFF_TYPES.PENETRATION].includes(skill)) {
        // Buff skills target allies
        target = aliveKarbitCards[Math.floor(Math.random() * aliveKarbitCards.length)];
      } else {
        // Debuff skills target enemies
        target = randomPlayerCard;
      }
      
      console.log(`AI using skill: ${skill} on ${target.name}`);
      return {
        action: 'skill',
        caster: randomKarbitCard,
        target: target,
        skill: skill
      };
    } else {
      // Default to attack
      console.log(`AI attacking: ${randomPlayerCard.name}`);
      return {
        action: 'attack',
        attacker: randomKarbitCard,
        caster: randomKarbitCard,
        target: randomPlayerCard
      };
    }
  }
}
