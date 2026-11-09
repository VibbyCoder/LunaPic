const { app, BrowserWindow, ipcMain, protocol, net, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

let mainWindow;
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
            const filePath = commandLine.find(arg => arg.match(/\.(png|jpe?g|webp|gif|bmp)$/i));
            if (filePath) mainWindow.webContents.send('open-file', filePath);
        }
    });

    app.whenReady().then(() => {
        protocol.handle('local', (request) => {
            const urlWithoutQuery = request.url.split('?')[0];
            const decodedPath = decodeURIComponent(urlWithoutQuery.slice('local://'.length));
            return net.fetch(pathToFileURL(decodedPath).toString());
        });
        createWindow();
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200, height: 800, minWidth: 600, minHeight: 400,
        frame: false, backgroundColor: '#000000',
        icon: path.join(__dirname, 'build', 'icon.ico'), // ADD THIS LINE
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, 
            nodeIntegration: false,
            webSecurity: false
        }
    });
    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
    mainWindow.webContents.on('did-finish-load', () => {
        const filePath = process.argv.find(arg => arg.match(/\.(png|jpe?g|webp|gif|bmp)$/i));
        if (filePath) mainWindow.webContents.send('open-file', filePath);
    });
}

ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
});
ipcMain.on('window-close', () => mainWindow.close());

ipcMain.handle('get-folder-images', (event, targetPath) => {
    try {
        const dir = path.dirname(targetPath);
        const files = fs.readdirSync(dir);
        const images = files.filter(file => /\.(png|jpe?g|webp|gif|bmp)$/i.test(file))
                            .sort(new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'}).compare);
        return { dir: dir, images: images, currentFileName: path.basename(targetPath) };
    } catch (err) { return null; }
});

ipcMain.handle('get-file-meta', (event, filePath) => {
    try {
        const stats = fs.statSync(filePath);
        return { sizeMB: (stats.size / (1024 * 1024)).toFixed(2) + ' MB', date: stats.mtime.toLocaleString(), location: 'N/A' };
    } catch (err) {
        return { sizeMB: 'Unknown', date: 'Unknown', location: 'N/A' };
    }
});

ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'], filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'] }]
    });
    if (!result.canceled && result.filePaths.length > 0) return result.filePaths[0];
    return null;
});