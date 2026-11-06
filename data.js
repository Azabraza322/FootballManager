const CFG = {
  incomeBase: 5,
  stadiumCostBase: 100,
  playerUpgradeBase: 50,
  matchRewardBase: 100,
  enemyHpBase: 100,
  enemyHpGrowth: 1.2,
  soulBonus: 0.1 // +10% за каждый кубок
};

let S = { 
  cash: 100, 
  wave: 1, 
  stadiumLvl: 1, 
  souls: 0, // Кубки
  prestiges: 0,
  bestWave: 1,
  auto: false,
  soundOn: true,
  lastDaily: 0,
  lastSaved: Date.now()
};

let PLAYERS = [
  { id: 0, name: 'Нападающий', icon: '⚽', atk: 10, cost: 50, color: 0xef4444, equipped: { boots: null, gloves: null, armband: null } },
  { id: 1, name: 'Полузащитник', icon: '👟', atk: 5, cost: 30, color: 0x22c55e, equipped: { boots: null, gloves: null, armband: null } },
  { id: 2, name: 'Защитник', icon: '🛡️', atk: 2, cost: 20, color: 0x3b82f6, equipped: { boots: null, gloves: null, armband: null } }
];

let INVENTORY = [];

function saveGame() {
  S.lastSaved = Date.now();
  try { localStorage.setItem('footballSave_v5', JSON.stringify({ S, PLAYERS, INVENTORY })); } catch(e) {}
}

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem('footballSave_v5') || '{}');
    if (saved.S) Object.assign(S, saved.S);
    
    const defaultPlayers = [
      { id: 0, name: 'Нападающий', icon: '⚽', atk: 10, cost: 50, color: 0xef4444, equipped: { boots: null, gloves: null, armband: null } },
      { id: 1, name: 'Полузащитник', icon: '👟', atk: 5, cost: 30, color: 0x22c55e, equipped: { boots: null, gloves: null, armband: null } },
      { id: 2, name: 'Защитник', icon: '🛡️', atk: 2, cost: 20, color: 0x3b82f6, equipped: { boots: null, gloves: null, armband: null } }
    ];

    if (saved.PLAYERS && saved.PLAYERS.length === 3) {
      PLAYERS = saved.PLAYERS.map((p, i) => {
        let base = defaultPlayers[i];
        p.equipped = Object.assign({ boots: null, gloves: null, armband: null }, p.equipped);
        return Object.assign(base, p);
      });
    }
    if (saved.INVENTORY) INVENTORY = saved.INVENTORY;
  } catch(e) {}
}