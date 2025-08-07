// Card types: dps, sub-dps, healer, buffer-debuffer
export const CARD_TYPES = {
  DPS: 'dps',
  SUB_DPS: 'sub-dps', 
  HEALER: 'healer',
  BUFFER_DEBUFFER: 'buffer-debuffer'
};

export const BUFF_TYPES = {
  SHIELD: 'shield',
  HEAL: 'heal',
  PENETRATION: 'pen'
};

export const DEBUFF_TYPES = {
  POISON: 'poison',
  BLEEDING: 'bleed',
  STUN: 'stun',
  BREAK: 'break' // debuff baru: ngurangin armor
};

export const ULTIMATE_TYPES = {
  BOMB: 'bomb', // Reze - Kill target + self
  BETH_BURST: 'beth_burst', // Beth - DPS burst
  METEOR: 'meteor', // March - Shield team + AOE damage
  RESURRECTION: 'resurrection', // Sakura - Revive all allies
  DOMAIN: 'domain', // Shorekeeper - Heal team + penetration buff
  REVERSE_TIME: 'reverse_time', // Kurumi - Undo last damage + extra turn
  NUKE: 'nuke', // Ryou - AOE damage + stun one enemy
  FORTRESS: 'fortress', // Hinata - Shield + heal all allies
  PLAGUE: 'plague', // Hu Tao - AOE damage + self heal based on damage
  INSPIRE: 'inspire', // Madoka - 50% penetration buff to team
  BERSERK_PHASE1: 'berserk_phase1', // Zani - Enter berserk mode
  BERSERK_PHASE2: 'berserk_phase2', // Zani - Burst damage based on low HP
  SMILE: 'smile', // Waguri - Stun all enemies + extra turn
  ANXIETY: 'anxiety' // Bocchi - AOE damage + bleeding
};

// Sample card pool for gacha
export const cardPool = [
  {
    id: 1,
    name: "Hinata",
    image: `${import.meta.env.BASE_URL}cards/hinata.jpeg`,
    type: CARD_TYPES.SUB_DPS,
    maxHp: 110,
    hp: 110,
    atk: 32,
    def: 18,
    speed: 22,
    maxEnergy: 100,
    energy: 0,
    skills: [BUFF_TYPES.SHIELD],
    ultimate: {
      type: ULTIMATE_TYPES.FORTRESS,
      name: "Gentle Step",
      description: "Shield + heal all allies"
    },
    rarity: 'SR'
  },
  {
    id: 2,
    name: "Sakura",
    image: `${import.meta.env.BASE_URL}cards/sakura.jpeg`,
    type: CARD_TYPES.HEALER,
    maxHp: 130,
    hp: 130,
    atk: 14,
    def: 28,
    speed: 15,
    maxEnergy: 100,
    energy: 0,
    skills: [BUFF_TYPES.HEAL],
    ultimate: {
      type: ULTIMATE_TYPES.RESURRECTION,
      name: "Medical Ninjutsu",
      description: "Revive all fallen allies"
    },
    rarity: 'R'
  },
  {
    id: 3,
    name: "Zani",
    image: `${import.meta.env.BASE_URL}cards/zani.jpeg`,
    type: CARD_TYPES.DPS,
    maxHp: 95,
    hp: 95,
    atk: 38,
    def: 16,
    speed: 25,
    maxEnergy: 100,
    energy: 0,
    skills: [DEBUFF_TYPES.BLEEDING],
    ultimate: {
      type: ULTIMATE_TYPES.BERSERK,
      name: "Berserk Mode",
      description: "Burst musuh, buff penetration ke tim, debuff break ke musuh"
    },
    rarity: 'SSR'
  },
  {
    id: 4,
    name: "Shorekeeper", 
    image: `${import.meta.env.BASE_URL}cards/shorekeeper.jpeg`,
    type: CARD_TYPES.HEALER,
    maxHp: 100,
    hp: 100,
    atk: 16,
    def: 20,
    speed: 30,
    maxEnergy: 100,
    energy: 0,
    skills: [BUFF_TYPES.PENETRATION, BUFF_TYPES.HEAL],
    ultimate: {
      type: ULTIMATE_TYPES.DOMAIN,
      name: "Resonance Domain",
      description: "Heal team + penetration buff"
    },
    rarity: 'SSR'
  },
  {
    id: 5,
    name: "Kurumi",
    image: `${import.meta.env.BASE_URL}cards/kurumi.jpeg`,
    type: CARD_TYPES.DPS,
    maxHp: 140,
    hp: 140,
    atk: 30,
    def: 30,
    speed: 10,
    maxEnergy: 100,
    energy: 0,
    skills: [BUFF_TYPES.HEAL],
    ultimate: {
      type: ULTIMATE_TYPES.REVERSE_TIME,
      name: "Zafkiel: Aleph",
      description: "Reverse last damage + extra turn"
    },
    rarity: 'SSR'
  },
  {
    id: 6,
    name: "Madoka Yuzuhara",
    image: `${import.meta.env.BASE_URL}cards/madoka.jpeg`,
    type: CARD_TYPES.BUFFER_DEBUFFER,
    maxHp: 100,
    hp: 100,
    atk: 24,
    def: 22,
    speed: 35,
    maxEnergy: 100,
    energy: 0,
    skills: [BUFF_TYPES.PENETRATION, DEBUFF_TYPES.STUN],
    ultimate: {
      type: ULTIMATE_TYPES.INSPIRE,
      name: "Divine Inspiration",
      description: "Grant 50% penetration buff to team"
    },
    rarity: 'SR'
  },
  {
    id: 7,
    name: "Reze",
    image: `${import.meta.env.BASE_URL}cards/reze.jpeg`,
    type: CARD_TYPES.SUB_DPS,
    maxHp: 115,
    hp: 115,
    atk: 28,
    def: 32,
    speed: 12,
    maxEnergy: 100,
    energy: 0,
    skills: [BUFF_TYPES.PENETRATION, DEBUFF_TYPES.STUN],
    ultimate: {
      type: ULTIMATE_TYPES.BOMB,
      name: "Bomb Devil",
      description: "Kill target enemy + self"
    },
    rarity: 'SR'
  },
  {
    id: 8,
    name: "March 7th",
    image: `${import.meta.env.BASE_URL}cards/march.jpeg`,
    type: CARD_TYPES.BUFFER_DEBUFFER,
    maxHp: 90,
    hp: 90,
    atk: 22,
    def: 18,
    speed: 40,
    maxEnergy: 100,
    energy: 0,
    skills: [BUFF_TYPES.PENETRATION, BUFF_TYPES.SHIELD],
    ultimate: {
      type: ULTIMATE_TYPES.METEOR,
      name: "Glacial Cascade",
      description: "Shield team + AOE ice damage"
    },
    rarity: 'R'
  },
  {
    id: 9,
    name: "Waguri Kaoruko",
    image: `${import.meta.env.BASE_URL}cards/waguri.jpeg`,
    type: CARD_TYPES.BUFFER_DEBUFFER,
    maxHp: 95,
    hp: 95,
    atk: 24,
    def: 24,
    speed: 28,
    maxEnergy: 100,
    energy: 0,
    skills: [DEBUFF_TYPES.STUN],
    ultimate: {
      type: ULTIMATE_TYPES.SMILE,
      name: "Menacing Smile",
      description: "Stun all enemies + extra turn"
    },
    rarity: 'SR'
  },
  {
    id: 10,
    name: "Hu Tao",
    image: `${import.meta.env.BASE_URL}cards/hu tao.jpeg`,
    type: CARD_TYPES.DPS,
    maxHp: 80,
    hp: 80,
    atk: 34,
    def: 16,
    speed: 32,
    maxEnergy: 100,
    energy: 0,
    skills: [DEBUFF_TYPES.BLEEDING],
    ultimate: {
      type: ULTIMATE_TYPES.PLAGUE,
      name: "Paramita Papilio",
      description: "Ghost AOE damage + self heal"
    },
    rarity: 'SSR'
  },
  {
    id: 11,
    name: "Ryou Yamada",
    image: `${import.meta.env.BASE_URL}cards/ryo.jpeg`,
    type: CARD_TYPES.SUB_DPS,
    maxHp: 80,
    hp: 80,
    atk: 30,
    def: 18,
    speed: 22,
    maxEnergy: 100,
    energy: 0,
    skills: [BUFF_TYPES.PENETRATION, BUFF_TYPES.SHIELD],
    ultimate: {
      type: ULTIMATE_TYPES.NUKE,
      name: "Bass Drop",
      description: "AOE sound damage + stun one enemy"
    },
    rarity: 'SR'
  },
  {
    id: 12,
    name: "Bocchi Hitori",
    image: `${import.meta.env.BASE_URL}cards/bocchi.jpeg`,
    type: CARD_TYPES.DPS,
    maxHp: 90,
    hp: 90,
    atk: 22,
    def: 22,
    speed: 18,
    maxEnergy: 100,
    energy: 0,
    skills: [DEBUFF_TYPES.POISON],
    ultimate: {
      type: ULTIMATE_TYPES.ANXIETY,
      name: "Social Meltdown",
      description: "Heavy AOE damage + bleeding debuff"
    },
    rarity: 'SSR'
  },
  {
    id: 13,
    name: "Beth",
    image: `${import.meta.env.BASE_URL}cards/beth.jpg`,
    type: CARD_TYPES.DPS,
    maxHp: 85,
    hp: 85,
    atk: 40,
    def: 14,
    speed: 26,
    maxEnergy: 100,
    energy: 0,
    skills: [DEBUFF_TYPES.BREAK],
    ultimate: {
      type: ULTIMATE_TYPES.BETH_BURST,
      name: "Burst Shot",
      description: "Massive single-target DPS burst"
    },
    rarity: 'SR'
  }
];

// Function to get balanced team composition
export function getBalancedTeam() {
  const dpsCards = cardPool.filter(card => card.type === CARD_TYPES.DPS);
  const subDpsCards = cardPool.filter(card => card.type === CARD_TYPES.SUB_DPS);
  const healerCards = cardPool.filter(card => card.type === CARD_TYPES.HEALER);
  const bufferCards = cardPool.filter(card => card.type === CARD_TYPES.BUFFER_DEBUFFER);
  
  // Pick one from each category
  const dps = dpsCards[Math.floor(Math.random() * dpsCards.length)];
  const subDps = subDpsCards[Math.floor(Math.random() * subDpsCards.length)];
  
  // Randomly pick healer or buffer for 3rd slot
  const supportPool = [...healerCards, ...bufferCards];
  const support = supportPool[Math.floor(Math.random() * supportPool.length)];
  
  return [dps, subDps, support].map(card => ({
    ...card,
    hp: card.maxHp,
    energy: 0,
    buffs: [],
    debuffs: [],
    shield: 0,
    isStunned: false,
    berserkMode: false,
    lastDamageReceived: 0 // For Kurumi's reverse time
  }));
}

// Function to get random cards for battle (old method, keeping for compatibility)
export function getRandomCards(count = 3) {
  const shuffled = [...cardPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(card => ({
    ...card,
    hp: card.maxHp, // Reset HP
    energy: 0,
    buffs: [],
    debuffs: [],
    shield: 0,
    isStunned: false,
    berserkMode: false,
    lastDamageReceived: 0
  }));
}

// Default teams - now balanced!
export const playerTeam = getBalancedTeam();
export const karbitTeam = getBalancedTeam();
