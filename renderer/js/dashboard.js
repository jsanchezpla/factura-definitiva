// dashboard.js

// Botón para ir a la Factura Estándar
document.getElementById("btn-standard").addEventListener("click", () => {
  // Asegúrate de que el archivo se llame así en tu carpeta html
  window.location.href = "standard-invoice.html";
});

// Botón para ir a la Factura por Peso
document.getElementById("btn-weight").addEventListener("click", () => {
  // Asegúrate de que el archivo se llame así en tu carpeta html
  window.location.href = "weight-invoice.html";
});

document.getElementById("btn-customer").addEventListener("click", () => {
  // Asegúrate de que el archivo se llame así en tu carpeta html
  window.location.href = "customer-manager.html";
});
