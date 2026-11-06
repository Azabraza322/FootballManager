class UIScene extends Phaser.Scene {
  createPanel(x, y, w, h, color = 0x1e2630, border = 0x3b5b7a) {
    const g = this.add.graphics(); g.fillStyle(color, 1); g.lineStyle(4, border, 1);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 20); g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 20);
  }
  createButton(x, y, w, h, text, callback, color = 0x2563eb) {
    const btn = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, h, color).setInteractive({ useHandCursor: true });
    const txt = this.add.text(0, 0, text, { fontSize: '32px', fill: '#fff', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
    btn.add([bg, txt]);
    bg.on('pointerdown', () => bg.setScale(0.95));
    bg.on('pointerout', () => bg.setScale(1));
    bg.on('pointerup', () => { bg.setScale(1); SFX.click(); callback(); }); // Звук клика
    return btn;
  }
  toast(msg, color = '#fff') {
    const t = this.add.text(540, 220, msg, { fontSize: '36px', fill: color, fontStyle: 'bold', backgroundColor: '#000a', padding: { x: 20, y: 12 }, align: 'center', wordWrap: { width: 900 } }).setOrigin(0.5).setDepth(300);
    this.tweens.add({ targets: t, y: 160, alpha: 0, delay: 1200, duration: 700, onComplete: () => t.destroy() });
  }
}

class MainScene extends UIScene {
  createTabs(activeTab) {
    this.createPanel(540, 90, 1080, 180, 0x1a1a1a, 0x333333);
    const tabs = [
      { id: 'club', label: '🏟️ База', x: 135, scene: 'ClubScene' }, 
      { id: 'squad', label: '👥 Состав', x: 405, scene: 'SquadScene' },
      { id: 'inv', label: '🎒 Сумка', x: 675, scene: 'InventoryScene' },
      { id: 'match', label: '🏆 Матч', x: 945, scene: 'MatchScene' }
    ];
    tabs.forEach(t => {
      this.add.text(t.x, 90, t.label, { fontSize: '36px', fill: activeTab === t.id ? '#22c55e' : '#555' }).setOrigin(0.5);
      const zone = this.add.rectangle(t.x, 90, 250, 160, 0x000000, 0).setInteractive();
      zone.on('pointerdown', () => { 
        if (activeTab !== t.id) { saveGame(); this.scene.start(t.scene); }
      });
    });
  }
}