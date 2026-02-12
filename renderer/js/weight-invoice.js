// --- 1. CONFIGURACIÓN INICIAL ---
document.getElementById("fecha-factura").valueAsDate = new Date();

// --- 2. LÓGICA DE CLIENTES (Igual que antes) ---
const clientesMap = {};

async function cargarCSV () {
  try {
    const texto = await window.api.leerCSV("customers.csv");
    const lineas = texto.split("\n").map(l => l.trim()).filter(Boolean).slice(1);
    const select = document.getElementById("d-select");

    select.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.text = "Seleccione un cliente";
    select.appendChild(defaultOption);

    lineas.forEach(linea => {
      const campos = parseCSVLine(linea);
      const nombre = campos[0];
      clientesMap[nombre] = {
        domicilio: campos[1],
        poblacion: campos[2],
        nif: campos[3]
      };
      const option = document.createElement("option");
      option.value = nombre;
      option.textContent = nombre;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      const data = clientesMap[select.value];
      if (data) {
        document.getElementById("domicilio").textContent = data.domicilio;
        document.getElementById("poblacion").textContent = data.poblacion;
        document.getElementById("nif").textContent = data.nif;
      }
    });
  } catch (error) {
    console.error("Error CSV:", error);
  }
}

function parseCSVLine (linea) {
  const partes = [];
  let actual = "";
  let dentroDeComillas = false;
  for (const c of linea) {
    if (c === "\"") dentroDeComillas = !dentroDeComillas;
    else if (c === "," && !dentroDeComillas) {
      partes.push(actual.trim());
      actual = "";
    } else actual += c;
  }
  partes.push(actual.trim());
  return partes;
}

// --- 3. NUEVA LÓGICA DEL BOTÓN ÚNICO ---

const tableBody = document.getElementById("table-body");

document.getElementById("add-group-btn").addEventListener("click", () => {
  const tableBody = document.getElementById("table-body"); // Aseguramos que tenemos la tabla

  // PASO 1: Crear fila de FECHA (Albarán)
  const rowFecha = document.createElement("tr");
  rowFecha.classList.add("albaran-row");

  const tdFecha = document.createElement("td");
  tdFecha.colSpan = 4; // Ocupa todo el ancho

  // Creamos un div para poner "Albarán" + el selector de fecha
  const divFlex = document.createElement("div");
  divFlex.classList.add("albaran-flex");

  const labelTexto = document.createElement("span");
  labelTexto.textContent = "Albarán: ";

  const inputFecha = document.createElement("input");
  inputFecha.type = "date";
  inputFecha.classList.add("input-fecha-tabla");
  inputFecha.valueAsDate = new Date();

  divFlex.appendChild(labelTexto);
  divFlex.appendChild(inputFecha);
  tdFecha.appendChild(divFlex);
  rowFecha.appendChild(tdFecha);

  // PASO 2: Crear fila de PRODUCTO (Datos)
  const rowProd = document.createElement("tr");

  // --- COLUMNA KG ---
  const tdKg = document.createElement("td");
  const inputKg = document.createElement("input");
  inputKg.type = "number";
  inputKg.step = "0.01";
  inputKg.placeholder = "0.00";

  // TRUCO: Formatear a 2 decimales al salir
  inputKg.addEventListener("change", function () {
    if (this.value) this.value = parseFloat(this.value).toFixed(2);
  });

  tdKg.appendChild(inputKg);

  // --- COLUMNA CONCEPTO ---
  const tdConcepto = document.createElement("td");
  const inputConcepto = document.createElement("input");
  inputConcepto.type = "text";
  inputConcepto.placeholder = "Producto...";
  tdConcepto.appendChild(inputConcepto);

  // --- COLUMNA PRECIO/KG ---
  const tdPrecioKg = document.createElement("td");
  const inputPrecioKg = document.createElement("input");
  inputPrecioKg.type = "number";
  inputPrecioKg.step = "0.01";
  inputPrecioKg.placeholder = "0.00";

  // TRUCO: Formatear a 2 decimales al salir
  inputPrecioKg.addEventListener("change", function () {
    if (this.value) this.value = parseFloat(this.value).toFixed(2);
  });

  tdPrecioKg.appendChild(inputPrecioKg);

  // --- COLUMNA TOTAL ---
  const tdTotal = document.createElement("td");
  const inputTotal = document.createElement("input");
  inputTotal.type = "text";
  inputTotal.readOnly = true;
  inputTotal.value = "0,00 €";
  inputTotal.classList.add("subtotal-row");
  tdTotal.appendChild(inputTotal);

  rowProd.append(tdKg, tdConcepto, tdPrecioKg, tdTotal);

  // PASO 3: Añadir ambas filas a la tabla
  tableBody.appendChild(rowFecha);
  tableBody.appendChild(rowProd);

  // Eventos para calcular
  inputKg.addEventListener("input", () => calcularFila(rowProd));
  inputPrecioKg.addEventListener("input", () => calcularFila(rowProd));
});

// Botón Borrar (Borra el último BLOQUE completo: Producto y Fecha)
document.getElementById("remove-btn").addEventListener("click", () => {
  // 1. Borramos la última fila (la del producto)
  if (tableBody.lastElementChild) {
    tableBody.removeChild(tableBody.lastElementChild);
  }

  // 2. Inmediatamente borramos la anterior (la de la fecha/albarán)
  if (tableBody.lastElementChild) {
    tableBody.removeChild(tableBody.lastElementChild);
  }

  // 3. Recalculamos totales (por si la fila borrada tenía dinero)
  calcularTotalesGlobales();
});

document.getElementById("btn-imprimir").addEventListener("click", () => {
  // 1. Leemos el número actual (o 701 si está vacío)
  // eslint-disable-next-line no-undef
  const numeroActual = parseInt(localStorage.getItem("contadorFacturas")) || 701;

  // 2. Le sumamos 1 y lo guardamos en la memoria oculta para la próxima vez
  // eslint-disable-next-line no-undef
  localStorage.setItem("contadorFacturas", numeroActual);

  // 3. Imprimimos la pantalla
  window.print();

  // (Opcional) Si quieres que tras imprimir vuelva al inicio para hacer otra:
  generarNumeroFactura();
});

// --- 4. CÁLCULOS (Igual que antes) ---

function calcularFila (row) {
  const inputs = row.querySelectorAll("input");
  // [0]=Kg, [1]=Concepto, [2]=PrecioKg, [3]=Total

  const kgs = parseFloat(inputs[0].value) || 0;
  const precio = parseFloat(inputs[2].value) || 0;
  const totalLinea = kgs * precio;

  inputs[3].value = totalLinea.toFixed(2) + " €";
  inputs[3].dataset.value = totalLinea;

  calcularTotalesGlobales();
}

function calcularTotalesGlobales () {
  const subtotales = document.querySelectorAll(".subtotal-row");
  let sumaTotal = 0;

  subtotales.forEach(input => {
    const val = parseFloat(input.dataset.value) || 0;
    sumaTotal += val;
  });

  const iva = sumaTotal * 0.10;
  const total = sumaTotal + iva;
  const fmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

  document.getElementById("suma").textContent = "SUMA: " + fmt.format(sumaTotal);
  document.getElementById("iva").textContent = "I.V.A 10%: " + fmt.format(iva);
  document.getElementById("total").textContent = "TOTAL: " + fmt.format(total);
}

cargarCSV();

// --- SISTEMA DE NUMERACIÓN AUTOMÁTICA ---

function generarNumeroFactura () {
  // 1. Sacamos el año actual (ej: 2026 -> "26")
  const hoy = new Date();
  const año2Digitos = hoy.getFullYear().toString().slice(-2);

  // 2. Buscamos en la memoria el último número.
  // Si no hay nada (es la primera vez que usa la app), empezamos en 701.
  // eslint-disable-next-line no-undef
  let numeroActual = localStorage.getItem("contadorFacturas");

  if (!numeroActual) {
    numeroActual = 743;
  }

  // 3. Lo juntamos en el formato "701/26"
  const numeroFormateado = `${numeroActual}/${año2Digitos}`;

  // 4. Lo escribimos en la pantalla
  document.getElementById("num-factura").value = numeroFormateado;
}

// Llamamos a la función nada más abrir la pantalla para que aparezca el número
generarNumeroFactura();
