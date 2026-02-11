const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  leerCSV: (archivo) => ipcRenderer.invoke("leer-csv", archivo),
  guardarCSV: (archivo, contenido) => ipcRenderer.invoke("guardar-csv", archivo, contenido)
});
