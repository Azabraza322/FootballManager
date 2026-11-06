class MatchScene extends MainScene {
  constructor() { super('MatchScene'); }
  create() {
    this.createTabs('match');
    this.inMatch = false;
    this.matchTime = 0;
    this.score = { home: 0, away: 0 };
    this.enemyAtk = 8;
    this.enemyDef = 8;
    this.isPlayingEvent = false; // Флаг, чтобы события не накладывались

    // --- ФОН ПОЛЯ ---
    this.add.rectangle(540, 960, 1080, 1920, 0x1e3f20).setDepth(-1);
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) this.add.rectangle(540, 200 + i * 170, 1080, 170, 0x1a3620).setDepth(-1);
    }
    this.add.circle(540, 960, 200, 0x000000, 0).setStrokeStyle(4, 0xffffff, 0.2).setDepth(-1);
    this.add.rectangle(540, 960, 1000, 4, 0xffffff, 0.5).setDepth(-1); 
    this.add.rectangle(540, 500, 700, 4, 0xffffff, 0.5).setDepth(-1); 
    this.add.rectangle(540, 1450, 700, 4, 0xffffff, 0.5).setDepth(-1); 

    // --- ТАБЛО ---
    this.createPanel(540, 340, 960, 280, 0x0a0a0a, 0xffffff);
    this.homeScoreText = this.add.text(280, 300, '0', { fontSize: '120px', fill: '#22c55e', fontStyle: 'bold' }).setOrigin(0.5);
    this.awayScoreText = this.add.text(800, 300, '0', { fontSize: '120px', fill: '#ef4444', fontStyle: 'bold' }).setOrigin(0.5);
    this.clockText = this.add.text(540, 300, "0'", { fontSize: '60px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(280, 430, 'ТЫ', { fontSize: '30px', fill: '#22c55e' }).setOrigin(0.5);
    this.add.text(800, 430, 'СОПЕРНИК', { fontSize: '30px', fill: '#ef4444' }).setOrigin(0.5);

    // --- ВОРОТА И ВРАТАРИ ---
    this.enemyGoal = this.add.text(540, 620, '🥅', { fontSize: '180px' }).setOrigin(0.5).setDepth(5);
    this.myGoal = this.add.text(540, 1600, '🥅', { fontSize: '180px' }).setOrigin(0.5).setAlpha(0.8).setDepth(5);
    this.enemyGk = this.add.text(540, 680, '🧤', { fontSize: '70px' }).setOrigin(0.5).setDepth(6).setTint(0xff8888);
    this.myGk = this.add.text(540, 1520, '🧤', { fontSize: '70px' }).setOrigin(0.5).setDepth(6).setTint(0x88ff88);

    this.enemyName = this.add.text(540, 880, '', { fontSize: '28px', fill: '#aaa', align: 'center' }).setOrigin(0.5);

    // --- ИГРОКИ ---
    this.enemySprites = [];
    let enemyIcons = ['🛡️', '👟', '⚽'];
    for (let i = 0; i < 3; i++) {
      let x = 250 + i * 290;
      let y = 900;
      let sprite = this.add.text(x, y, enemyIcons[i], { fontSize: '80px' }).setOrigin(0.5).setDepth(3).setTint(0xffaaaa);
      this.enemySprites.push({ sprite, x, y });
    }

    this.playerSprites = [];
    PLAYERS.forEach((p, i) => {
      let x = 250 + i * 290;
      let y = 1250;
      let sprite = this.add.text(x, y, p.icon, { fontSize: '80px' }).setOrigin(0.5).setDepth(3);
      this.playerSprites.push({ sprite, x, y });
      this.add.text(x, y + 70, p.name, { fontSize: '22px', fill: '#aaa' }).setOrigin(0.5);
      this.add.text(x, y + 105, `Сила: ${getPlayerAtk(p)}`, { fontSize: '22px', fill: '#22c55e' }).setOrigin(0.5);
    });

    // --- ЕДИНСТВЕННЫЙ МЯЧ ---
    this.ball = this.add.text(540, 960, '⚽', { fontSize: '50px' }).setOrigin(0.5).setDepth(10).setVisible(false);

    this.logText = this.add.text(60, 1730, 'Нажмите "Начать матч"', { fontSize: '26px', fill: '#aaa', wordWrap: { width: 960 } });

    this.startBtn = this.createButton(540, 1850, 700, 100, '▶️ Начать матч', () => this.startMatch(), 0x15803d);

    this.autoBtn = this.createButton(540, 240, 400, 80, '', () => {
      S.auto = !S.auto;
      this.refreshAuto();
      saveGame();
      if (S.auto && !this.inMatch) this.startMatch();
    }, 0x374151);
    this.autoLabel = this.autoBtn.list[1];

    this.refreshAuto();
    this.prepareMatch();
  }

  refreshAuto() {
    this.autoLabel.setText(S.auto ? '🔁 Авто: ВКЛ' : '🔁 Авто: ВЫКЛ');
    this.autoBtn.list[0].setFillStyle(S.auto ? 0x15803d : 0x374151);
  }

  prepareMatch() {
    let w = S.wave;
    this.enemyAtk = Math.floor(8 * Math.pow(1.15, w - 1));
    this.enemyDef = Math.floor(8 * Math.pow(1.15, w - 1));

    let title = `Соперник ${w}`;
    if (w % 5 === 0) {
      title = `👑 БОСС ${w}`;
      this.enemyAtk = Math.floor(this.enemyAtk * 1.3);
      this.enemyDef = Math.floor(this.enemyDef * 1.3);
    } else if (w % 3 === 0) {
      title = `🚌 Автобус ${w}`;
      this.enemyDef = Math.floor(this.enemyDef * 1.8);
      this.enemyAtk = Math.floor(this.enemyAtk * 0.7);
    }

    this.enemyName.setText(`${title}\nАтака: ${this.enemyAtk} | Защита: ${this.enemyDef}`);
  }

  updateScoreboard() {
    this.homeScoreText.setText(this.score.home);
    this.awayScoreText.setText(this.score.away);
    this.clockText.setText(`${this.matchTime}'`);
  }

  addLog(msg) {
    let c = this.logText.text.split('\n'); c.unshift(msg);
    if (c.length > 4) c.pop();
    this.logText.setText(c.join('\n'));
  }

  startMatch() {
    if (this.inMatch) return;
    this.inMatch = true;
    this.matchTime = 0;
    this.score = { home: 0, away: 0 };
    this.isPlayingEvent = false;
    this.startBtn.setVisible(false);
    this.prepareMatch();
    this.updateScoreboard();
    this.ball.setVisible(true);
    this.addLog(`⚽ Матч начался! Соперник ${S.wave}.`);

    // Запускаем цепочку
    this.time.delayedCall(1000, () => this.nextMinute());
  }

  nextMinute() {
    if (!this.inMatch) return;
    if (this.matchTime >= 90) {
      this.endMatch();
      return;
    }

    this.matchTime += 10;
    this.updateScoreboard();
    
    // Ставим мяч в центр
    this.ball.setPosition(540, 960).setScale(1).setAlpha(1);

    // Расчет владения
    let myPower = PLAYERS.reduce((sum, p) => sum + getPlayerAtk(p), 0);
    let totalPower = myPower + this.enemyAtk;
    let possessionChance = myPower / totalPower;

    if (Math.random() < possessionChance) {
      this.addLog(`🟢 Наше владение...`);
      this.startPossession(true, 0); // Наша команда
    } else {
      this.addLog(`🔴 Владение соперника...`);
      this.startPossession(false, 0); // Команда соперника
    }
  }

  startPossession(isOurTeam, passCount) {
    if (!this.inMatch) return;
    
    // Если сделали 2 паса — бьем по воротам
    if (passCount >= 2) {
      this.shoot(isOurTeam);
      return;
    }

    let targetPos;
    let targetIdx;

    if (isOurTeam) {
      // Выбираем случайного нашего игрока
      targetIdx = Math.floor(Math.random() * 3);
      targetPos = this.playerSprites[targetIdx];
      this.tweens.add({ targets: targetPos.sprite, scale: 1.3, yoyo: true, duration: 200 });
    } else {
      // Выбираем случайного врага
      targetIdx = Math.floor(Math.random() * 3);
      targetPos = this.enemySprites[targetIdx];
      this.tweens.add({ targets: targetPos.sprite, scale: 1.3, yoyo: true, duration: 200 });
    }

    // Летит мяч (пас)
    let ballColor = isOurTeam ? 0x22c55e : 0xef4444;
    this.ball.setTint(ballColor);

    this.tweens.add({
      targets: this.ball,
      x: targetPos.x,
      y: targetPos.y,
      duration: 300,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Проверка на перехват
        let interceptChance;
        if (isOurTeam) {
          // Соперник пытается отобрать у нас
          interceptChance = this.enemyDef / (this.enemyDef + (PLAYERS[targetIdx].atk * 2));
        } else {
          // Мы пытаемся отобрать у соперника
          interceptChance = getPlayerAtk(PLAYERS[2]) * 2 / (getPlayerAtk(PLAYERS[2]) * 2 + this.enemyAtk);
        }

        // Инвертируем шанс, так как проверяем "перехват"
        let isIntercepted = Math.random() < (isOurTeam ? interceptChance : (1 - interceptChance));

        if (isIntercepted) {
          this.addLog(isOurTeam ? '❌ Соперник перехватил пас!' : '✅ Мы отобрали мяч!');
          this.startPossession(!isOurTeam, 0); // Мяч перешел другой команде
        } else {
          // Пас успешен, продолжаем
          this.startPossession(isOurTeam, passCount + 1);
        }
      }
    });
  }

  shoot(isOurTeam) {
    let goalX = 540 + Phaser.Math.Between(-100, 100);
    let targetY = isOurTeam ? 620 : 1600;

    this.tweens.add({
      targets: this.ball,
      x: goalX,
      y: targetY,
      scale: 0.4,
      duration: 500,
      ease: 'Quad.easeIn',
      onComplete: () => {
        if (isOurTeam) {
          // Наш удар
          let totalAtk = PLAYERS.reduce((sum, p) => sum + getPlayerAtk(p), 0);
          let goalChance = Math.min(0.85, totalAtk / (totalAtk + this.enemyDef));
          
          if (Math.random() < goalChance) {
            this.score.home++;
            this.updateScoreboard();
            this.showGoalText('ГОЛ!', '#22c55e');
            SFX.win();
            this.addLog(`⚽ ГОЛ! (${this.score.home}:${this.score.away})`);
            this.enemyGoal.setTint(0xffdd00);
            this.cameras.main.shake(200, 0.01);
            this.time.delayedCall(500, () => this.enemyGoal.clearTint());
          } else {
            this.addLog(`🧤 Вратарь соперника спас!`);
            this.enemyGk.setTint(0xffffff);
            this.time.delayedCall(200, () => this.enemyGk.clearTint());
          }
        } else {
          // Удар соперника
          let myDef = getPlayerAtk(PLAYERS[2]) * 3;
          let enemyScoreChance = Math.min(0.85, this.enemyAtk / (this.enemyAtk + myDef));
          
          if (Math.random() < enemyScoreChance) {
            this.score.away++;
            this.updateScoreboard();
            this.showGoalText('ПРОПУСТИЛИ!', '#ef4444');
            SFX.lose();
            this.addLog(`❌ Соперник забил... (${this.score.home}:${this.score.away})`);
            this.myGoal.setTint(0xff0000);
            this.cameras.main.shake(300, 0.02);
            this.time.delayedCall(500, () => this.myGoal.clearTint());
          } else {
            this.addLog(`🧤 Наш вратарь спас!`);
            this.myGk.setTint(0xffffff);
            this.time.delayedCall(200, () => this.myGk.clearTint());
          }
        }
        
        // Ждем и запускаем следующий момент
        this.time.delayedCall(1500, () => this.nextMinute());
      }
    });
  }

  showGoalText(text, color) {
    let t = this.add.text(540, 960, text, { fontSize: '120px', fill: color, fontStyle: 'bold', stroke: '#000', strokeThickness: 10 }).setOrigin(0.5).setDepth(200);
    this.tweens.add({
      targets: t, y: 800, alpha: 0, scale: 1.5, duration: 1500, ease: 'Power2',
      onComplete: () => t.destroy()
    });
  }

  endMatch() {
    this.inMatch = false;
    this.ball.setVisible(false);

    let result = this.score.home > this.score.away ? 'win' : this.score.home === this.score.away ? 'draw' : 'lose';

    if (result === 'win') {
      let reward = Math.floor(CFG.matchRewardBase * S.wave * soulMult());
      S.cash += reward;
      S.bestWave = Math.max(S.bestWave, S.wave);
      S.wave++;
      let loot = generateLoot(S.wave - 1);
      INVENTORY.push(loot);
      this.addLog(`🏆 ПОБЕДА ${this.score.home}:${this.score.away}! +$${reward}\n🎁 Дроп: ${loot.name} (+${loot.atk})`);
      SFX.win();
    } else if (result === 'draw') {
      let reward = Math.floor(CFG.matchRewardBase * S.wave * soulMult() * 0.5);
      S.cash += reward;
      S.bestWave = Math.max(S.bestWave, S.wave);
      S.wave++;
      this.addLog(`🤝 Ничья ${this.score.home}:${this.score.away}! +$${reward}`);
    } else {
      let reward = Math.floor(CFG.matchRewardBase * S.wave * soulMult() * 0.2);
      S.cash += reward;
      this.addLog(`😢 Поражение ${this.score.home}:${this.score.away}. +$${reward} утешительно.`);
    }

    this.prepareMatch();
    this.updateScoreboard();
    saveGame();

    if (S.auto) {
      this.time.delayedCall(2500, () => this.startMatch());
    } else {
      this.startBtn.setVisible(true);
    }
  }
}