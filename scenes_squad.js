class SquadScene extends MainScene {
  constructor() { super('SquadScene'); }
  create() {
    this.createTabs('squad');
    this.add.text(540, 220, `💵 $${Math.floor(S.cash)}`, { fontSize: '44px', fill: '#fbbf24' }).setOrigin(0.5);

    PLAYERS.forEach((p, i) => {
      let y = 450 + i * 350;
      let totalAtk = getPlayerAtk(p);
      let bonus = totalAtk - p.atk;

      this.createPanel(540, y, 900, 300, 0x1e2630, p.color);
      this.add.text(200, y, p.icon, { fontSize: '100px' }).setOrigin(0.5);
      this.add.text(350, y - 80, p.name, { fontSize: '44px', fill: '#fff', fontStyle: 'bold' });
      
      let atkText = `Атака: ${totalAtk}`;
      if (bonus > 0) atkText += ` (+${bonus})`;
      this.add.text(350, y - 10, atkText, { fontSize: '36px', fill: bonus > 0 ? '#fbbf24' : '#22c55e' });
      
      this.createButton(750, y + 40, 250, 80, `$${p.cost}`, () => {
        if (S.cash >= p.cost) { S.cash -= p.cost; p.atk += 5; p.cost = Math.floor(p.cost * 1.5); saveGame(); this.scene.restart(); }
      });
    });
  }
}