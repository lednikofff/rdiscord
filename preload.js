const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  saveCookies: () => ipcRenderer.send('save-cookies'),
  loadCookies: () => ipcRenderer.send('load-cookies')
});
