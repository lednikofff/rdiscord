const { app, BrowserWindow, Tray, Menu, shell, globalShortcut, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;

// Проверка на единственный экземпляр приложения
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.exit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 800, // Начальная ширина
      height: 600, // Начальная высота
      minWidth: 799, // Минимальная ширина
      minHeight: 599, // Минимальная высота
      title: 'Discord', // Устанавливаем заголовок окна
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
      }
    });

    mainWindow.loadURL('https://discord.com/app');

    mainWindow.webContents.on('new-window', (event, url) => {
      if (!url.startsWith('https://discord.com')) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });

    mainWindow.on('close', (event) => {
      event.preventDefault();
      mainWindow.hide();
    });

    // Убираем Application Menu
    mainWindow.setMenu(null);
  }

  app.whenReady().then(() => {
    createWindow();

    // Загрузка иконки из файла
    const iconPath = path.join(__dirname, 'ic/tr.ico');
    const icon = nativeImage.createFromPath(iconPath);

    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Discord', enabled: false },
      { type: 'separator' },
      { label: 'Завершить сеанс', click: () => {
          fs.rmdirSync(app.getPath('userData'), { recursive: true });
          app.relaunch();
          app.exit();
        }
      },
      { type: 'separator' },
      { label: 'Выход из Discord', click: () => {
          app.isQuiting = true;
          app.exit();
        }
      }
    ]);

    tray.setToolTip('Discord');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      mainWindow.show();
    });

    globalShortcut.register('Control+L+3', () => {
      mainWindow.webContents.openDevTools();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.exit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on('before-quit', () => {
    app.isQuiting = true;
  });
}
