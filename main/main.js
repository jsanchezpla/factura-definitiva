const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow () {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile(path.join(__dirname, "../renderer/views/inicio.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.handle("leer-csv", async (event, archivo) => {
  const ruta = path.join(__dirname, "../data/", archivo);
  return fs.promises.readFile(ruta, "utf8");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
