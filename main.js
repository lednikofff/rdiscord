const { app, BrowserWindow, Tray, Menu, shell, globalShortcut, nativeImage, session } = require('electron');
const path = require('path');
let mainWindow;
let tray;

// Убираем аппаратное ускорение, ибо оно дает белый экран в тестах
app.disableHardwareAcceleration();

// Не даем размножаться окнам, так как второй экземпляр не сможет читать куки
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.exit();
} else {
    app.on('second-instance', () => {
        // Восстанавливаем окно, если процесс rdiscord.exe запущен
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        }
    });

    function createWindow() {
        // Создаём главное окно
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            minWidth: 799,
            minHeight: 599,
            title: 'Discord',
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9164 Chrome/124.0.6367.243 Electron/30.2.0 Safari/537.36'
            }
        });
        mainWindow.loadURL('https://discord.com/app');
        mainWindow.webContents.on('new-window', (event, url) => {
            // Открытие внешних ссылок в браузере (не электрон)
            if (!url.startsWith('https://discord.com')) {
                event.preventDefault();
                shell.openExternal(url);
            }
        });
        mainWindow.on('close', (event) => {
            // Ивент скрытия окна в трей, если нажали крестик
            event.preventDefault();
            mainWindow.hide();
        });
        mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
            // Дебаг инфа 1
            console.error(`Не удалось загрузить URL: ${validatedURL} с ошибкой: ${errorDescription} (${errorCode})`);
        });
        mainWindow.webContents.on('crashed', () => {
            // еще дебаг
            console.error('Содержимое окна крашнулось');
        });
        mainWindow.setMenu(null);
        const contextMenu = Menu.buildFromTemplate([
            { role: 'copy', label: 'Копировать' },
            { role: 'cut', label: 'Вырезать' },
            { role: 'paste', label: 'Вставить' }
        ]);
        mainWindow.webContents.on('context-menu', (event, params) => {
            // Контекстное меню Chrome (нужно для вырезания текста дял тех, кто не знает сочетания клавиш)
            contextMenu.popup(mainWindow, params.x, params.y);
        });
    }
            // Создаем иконку трея, и парсим иконку из каталога ic
    app.whenReady().then(() => {
        createWindow();
        const iconPath = path.join(__dirname, 'ic/tr.ico');
        const icon = nativeImage.createFromPath(iconPath);
        tray = new Tray(icon);
        const trayContextMenu = Menu.buildFromTemplate([
            { label: 'Discord', enabled: false },
            { type: 'separator' },
            { label: 'Выход из Discord', click: () => { app.isQuiting = true; app.exit(); } }
        ]);
        tray.setToolTip('Discord');
        tray.setContextMenu(trayContextMenu);
        tray.on('click', () => {
            // Раскрытие основного окна из трея
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        });
        globalShortcut.register('Control+L+3', () => {
            // Открытие девтулсов
            mainWindow.webContents.openDevTools();
        });
    });

    app.on('window-all-closed', () => {
        // Если все окна будут закрыты, процесс завершится (учитывается пункт "Выйти из Discord" в трее!!!
        if (process.platform !== 'darwin') {
            app.exit();
        }
    });

    app.on('activate', () => {
        // код для мака, на форуме сказали шо нада
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    app.on('before-quit', () => {
        app.isQuiting = true;
    });
}
