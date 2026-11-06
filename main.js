// Ждем полной загрузки страницы и всех скриптов
window.addEventListener('load', () => {
  const config = {
    type: Phaser.AUTO, 
    width: 1080, 
    height: 1920, 
    parent: 'game-container', 
    backgroundColor: '#111',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    // Проверяем, что все сцены на месте (для надежности)
    scene: [ClubScene, SquadScene, InventoryScene, MatchScene]
  };

  const game = new Phaser.Game(config);
  
  // Запускаем фоновую экономику
  startIdleEngine();
});
