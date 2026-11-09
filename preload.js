const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('api', {
    windowMinimize: () => ipcRenderer.send('window-minimize'),
    windowMaximize: () => ipcRenderer.send('window-maximize'),
    windowClose: () => ipcRenderer.send('window-close'),
    
    getFolderImages: (filePath) => ipcRenderer.invoke('get-folder-images', filePath),
    getFileMeta: (filePath) => ipcRenderer.invoke('get-file-meta', filePath),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    
    onOpenFile: (callback) => ipcRenderer.on('open-file', (event, filePath) => callback(filePath)),
    getPathForFile: (file) => webUtils.getPathForFile(file)
});