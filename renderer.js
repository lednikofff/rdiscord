const { ipcRenderer } = require('electron');

setInterval(() => {
  ipcRenderer.send('save-cookies');
}, 29000);

ipcRenderer.on('load-cookies', () => {
  // Логика загрузки куки
});

window.addEventListener('beforeunload', () => {
  ipcRenderer.send('save-cookies');
});
