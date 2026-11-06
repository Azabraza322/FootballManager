loadGame();

// --- ЗВУКИ ---
let audioCtx = null;
function playTone(freq, type, duration, vol) {
  if (!S.soundOn) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
  } catch(e) {}
}
const SFX = {
  click: () => playTone(800, 'sine', 0.05, 0.05),
  hit: () => playTone(300, 'triangle', 0.1, 0.05),
  win: () => { playTone(400, 'square', 0.1, 0.05); setTimeout(()=>playTone(600, 'square', 0.2, 0.05), 100); },
  lose: () => playTone(200, 'sawtooth', 0.3, 0.05)
};

// --- ЭКОНОМИКА И ОФФЛАЙН ---
const soulMult = () => 1 + CFG.soulBonus * S.souls;

function getPlayerAtk(p) {
  let eqBonus = 0;
  if (p.equipped) {
    ['boots', 'gloves', 'armband'].forEach(slot => {
      if (p.equipped[slot]) eqBonus += p.equipped[slot].atk;
    });
  }
  return Math.floor((p.atk + eqBonus) * soulMult());
}

// Оффлайн доход
const offSeconds = Math.min(Math.floor((Date.now() - S.lastSaved) / 1000), 28800);
if (offSeconds > 10) {
  let earned = Math.floor(offSeconds * (CFG.incomeBase * S.stadiumLvl) * soulMult());
  S.cash += earned;
  window.OFFLINE_REWARD = { sec: offSeconds, cash: earned };
}

// --- ПРЕСТИЖ ---
function prestigeGain() { return Math.floor(S.bestWave / 10); }
function doPrestige() {
  const gain = prestigeGain(); if (gain < 1) return;
  
  // Сохраняем только кубки и рекорды
  const keep = { souls: S.souls + gain, prestiges: S.prestiges + 1, bestWave: S.bestWave, soundOn: S.soundOn, auto: S.auto };
  Object.keys(S).forEach(k => delete S[k]);
  Object.assign(S, { cash: 100, wave: 1, stadiumLvl: 1, lastDaily: S.lastDaily, lastSaved: Date.now() }, keep);
  
  // Сбрасываем игроков и сумку
  PLAYERS.forEach(p => { p.atk = [10, 5, 2][p.id]; p.cost = [50, 30, 20][p.id]; p.equipped = { boots: null, gloves: null, armband: null }; });
  INVENTORY = [];
  saveGame();
}

// --- ЛУТ ---
function generateLoot(wave) {
  const types = ['boots', 'gloves', 'armband'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const r = Math.random();
  let rar = 'common', m = 1, color = 0xcccccc;
  if (r > 0.9) { rar = 'legendary'; m = 4; color = 0xfbbf24; }
  else if (r > 0.7) { rar = 'epic'; m = 3; color = 0x8b5cf6; }
  else if (r > 0.4) { rar = 'rare'; m = 2; color = 0x22c55e; }

  const names = {
    boots: ['Старые бутсы', 'Бутсы Profi', 'Магниевые бутсы', 'Золотые бутсы'],
    gloves: ['Тканевые перчатки', 'Вратарские перчатки', 'Перчатки с шипами', 'Перчатки Бога'],
    armband: ['Обычная повязка', 'Повязка лидера', 'Повязка капитана', 'Повязка Легенды']
  };
  
  const idx = rar === 'legendary' ? 3 : rar === 'epic' ? 2 : rar === 'rare' ? 1 : 0;
  return { id: Date.now() + Math.random(), name: names[type][idx], type: type, rarity: rar, color: color, atk: Math.floor(2 * wave * m) };
}

// --- ДВИЖОК ---
function startIdleEngine() {
  setInterval(() => {
    S.cash += (CFG.incomeBase * S.stadiumLvl * soulMult());
    if (typeof game !== 'undefined' && game.scene) {
      let active = game.scene.getScenes(true)[0];
      if (active && active.updateUI && active.scene.key === 'ClubScene') active.updateUI();
    }
  }, 1000);
  setInterval(() => { saveGame(); }, 10000);
}