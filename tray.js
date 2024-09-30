const { Tray, Menu, app } = require('electron');
const path = require('path');

let tray = null;

app.whenReady().then(() => {
  tray = new Tray(path.join(__dirname, 'ic/tr.dll'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Discord', enabled: false },
    { type: 'separator' },
    { label: 'Завершить сеанс', click: () => {
        // Логика завершения сеанса
      }
    },
    { type: 'separator' },
    { label: 'Выход из Discord', click: () => app.quit() }
  ]);

  tray.setToolTip('Discord');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    // Логика восстановления окна
  });
});
