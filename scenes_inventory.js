class InventoryScene extends MainScene {
  constructor() { super('InventoryScene'); }
  create() {
    this.createTabs('inv');
    this.add.text(540, 220, `🎒 Сумка (${INVENTORY.length})`, { fontSize: '44px', fill: '#fff' }).setOrigin(0.5);

    if (INVENTORY.length === 0) {
      return this.add.text(540, 500, 'Пусто... Победи в матче, чтобы получить экипировку!', { fontSize: '32px', fill: '#666', align: 'center', wordWrap: { width: 800 } }).setOrigin(0.5);
    }

    INVENTORY.slice(0, 4).forEach((item, index) => {
      const y = 400 + index * 340;
      const itemColor = item.color || 0xcccccc;
      const hexColor = '#' + itemColor.toString(16).padStart(6, '0');
      
      this.createPanel(540, y, 960, 300, 0x2a2a2a, itemColor);
      
      let icon = item.type === 'boots' ? '⚽' : item.type === 'gloves' ? '🧤' : '🎽';
      
      this.add.text(100, y - 70, icon, { fontSize: '60px' }).setOrigin(0.5);
      this.add.text(250, y - 90, item.name, { fontSize: '36px', fill: hexColor, fontStyle: 'bold' });
      this.add.text(250, y - 40, `+${item.atk} к атаке`, { fontSize: '28px', fill: '#8f8' });
      
      this.add.text(250, y + 20, 'Надеть на:', { fontSize: '24px', fill: '#aaa' });
      PLAYERS.forEach((p, i) => {
        this.createButton(350 + i * 200, y + 80, 180, 60, p.name, () => {
          const idx = INVENTORY.findIndex(inv => inv.id === item.id);
          if (idx < 0) return;
          const it = INVENTORY.splice(idx, 1)[0];
          if (p.equipped[it.type]) INVENTORY.push(p.equipped[it.type]);
          p.equipped[it.type] = it; 
          saveGame(); this.scene.restart();
        }, 0x3a4a3a);
      });

      this.createButton(860, y - 70, 120, 80, `💰\n$${item.atk * 10}`, () => {
        const idx = INVENTORY.findIndex(inv => inv.id === item.id);
        S.cash += item.atk * 10;
        INVENTORY.splice(idx, 1);
        saveGame(); this.scene.restart();
      }, 0x8b3a3a);
    });
  }
}