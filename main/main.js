const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow () {
  const win = new BrowserWindow({
    width: 900, // Dejamos esto por si el cliente le da al botón de "Restaurar tamaño"
    height: 600,
    show: false, // 1. TRUCO: Creamos la ventana de forma invisible al principio
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile(path.join(__dirname, "../renderer/views/dashboard.html"));

  // 2. Maximizamos la ventana internamente
  win.maximize();

  // 3. Una vez que ya está maximizada y lista, la mostramos de golpe
  win.show();
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

ipcMain.handle("guardar-csv", async (event, archivo, contenido) => {
  try {
    const filePath = path.join(__dirname, "../data/", archivo);
    fs.writeFileSync(filePath, contenido, "utf-8");
    return { success: true };
  } catch (error) {
    console.error("Error al guardar CSV:", error);
    return { success: false, error: error.message };
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
