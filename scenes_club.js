class ClubScene extends MainScene {
  constructor() { super('ClubScene'); }
  create() {
    this.createTabs('club');
    
    // Кнопка звука
    this.soundBtn = this.add.text(980, 220, '', { fontSize: '40px' }).setOrigin(0.5).setInteractive();
    this.soundBtn.on('pointerdown', () => { S.soundOn = !S.soundOn; this.updateSoundBtn(); saveGame(); SFX.click(); });
    this.updateSoundBtn();

    this.createPanel(540, 400, 900, 300, 0x1a1a1a, 0x22c55e);
    this.cashText = this.add.text(540, 380, '', { fontSize: '60px', fill: '#fff' }).setOrigin(0.5);
    this.incomeText = this.add.text(540, 480, '', { fontSize: '28px', fill: '#888' }).setOrigin(0.5);
    this.soulText = this.add.text(540, 520, '', { fontSize: '28px', fill: '#fbbf24' }).setOrigin(0.5);

    this.stadiumBtn = this.createButton(540, 750, 800, 100, '', () => {
      let cost = CFG.stadiumCostBase * S.stadiumLvl;
      if (S.cash >= cost) { S.cash -= cost; S.stadiumLvl++; saveGame(); this.updateUI(); }
    }, 0x15803d);

    // Ежедневка
    this.dailyBtn = this.createButton(540, 900, 800, 90, '', () => this.claimDaily(), 0xf59e0b);
    this.dailyLabel = this.dailyBtn.list[1];

    // Престиж
    this.pBtn = this.createButton(540, 1050, 800, 100, '', () => {
      if (prestigeGain() < 1) return this.toast('Нужна волна 10+', '#ff8b8b');
      if (confirm(`Сбросить прогресс и получить ${prestigeGain()} 🏆 Кубков?`)) {
        doPrestige(); this.scene.restart();
      }
    }, 0x6d28d9);
    this.pLabel = this.pBtn.list[1];

    // Сохранения
    this.createButton(300, 1200, 440, 80, '📤 Экспорт', () => prompt('Код:', localStorage.getItem('footballSave_v5')), 0x1e40af);
    this.createButton(780, 1200, 440, 80, '📥 Импорт', () => {
      const d = prompt('Вставь код:'); if(d) { localStorage.setItem('footballSave_v5', d); location.reload(); }
    }, 0x15803d);

    this.updateUI();

    if (window.OFFLINE_REWARD) {
      this.toast(`💤 Пока тебя не было (${Math.floor(window.OFFLINE_REWARD.sec/60)} мин): +$${window.OFFLINE_REWARD.cash}`, '#fbbf24');
      window.OFFLINE_REWARD = null;
    }
  }

  updateSoundBtn() { this.soundBtn.setText(S.soundOn ? '🔊' : '🔇'); }

  claimDaily() {
    if (Date.now() - (S.lastDaily || 0) < 86400000) return this.toast('Приходи через 24 часа!', '#ff8b8b');
    S.lastDaily = Date.now();
    let reward = 500 * S.wave;
    S.cash += reward;
    SFX.win();
    this.toast(`🎁 Награда: +$${reward}`, '#fbbf24');
    saveGame(); this.updateUI();
  }

  updateUI() {
    this.cashText.setText(`💵 $${Math.floor(S.cash)}`);
    this.incomeText.setText(`Доход: +$${Math.floor(CFG.incomeBase * S.stadiumLvl * soulMult())} / сек`);
    this.soulText.setText(`🏆 Кубки: ${S.souls} (+${Math.floor(S.souls * CFG.soulBonus * 100)}% к силе и доходу)`);
    
    this.stadiumBtn.list[1].setText(`Улучшить стадион (${S.stadiumLvl} ур.)\n$${CFG.stadiumCostBase * S.stadiumLvl}`);
    
    if (Date.now() - (S.lastDaily || 0) >= 86400000) {
      this.dailyLabel.setText('🎁 Забрать награду!'); this.dailyBtn.list[0].setFillStyle(0xf59e0b);
    } else {
      this.dailyLabel.setText('🎁 Награда получена'); this.dailyBtn.list[0].setFillStyle(0x444444);
    }
    
    this.pLabel.setText(prestigeGain() > 0 ? `🏆 Получить Кубки (+${prestigeGain()})` : '🏆 Кубки: нужна 10-я волна');
  }
}