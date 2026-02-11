/**
 * ============================================================================
 * LÓGICA DE LA FACTURA ESTÁNDAR (standard-invoice.js)
 * ============================================================================
 */

// --- 1. ESTADO GLOBAL ---
const estado = {
  clientes: {}, // Mapa de clientes (O(1) para búsquedas)
  numeroInicialFactura: 743 // Número por defecto si no hay nada guardado
};

// --- 2. INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  // 1. Establecer fecha de hoy en el campo principal
  document.getElementById("fecha-factura").valueAsDate = new Date();

  // 2. Generar el número de factura
  generarNumeroFactura();

  // 3. Cargar clientes desde el CSV
  cargarClientesCSV();

  // 4. Configurar eventos de botones
  document.getElementById("add-button").addEventListener("click", agregarFila);
  document.getElementById("remove-button").addEventListener("click", eliminarUltimaFila);
  document.getElementById("btn-imprimir").addEventListener("click", imprimirFactura);
});

// --- 3. GESTIÓN DE FACTURA Y CONTADOR ---
function generarNumeroFactura () {
  const hoy = new Date();
  const anioCorto = hoy.getFullYear().toString().slice(-2); // Ej: "26"

  // Leer de localStorage o usar el inicial
  // eslint-disable-next-line no-undef
  const numeroActual = parseInt(localStorage.getItem("contadorFacturas")) || estado.numeroInicialFactura;

  const formatoFactura = `${numeroActual}/${anioCorto}`;
  document.getElementById("num-factura").value = formatoFactura;
}

function imprimirFactura () {
  // 1. Leer número actual
  // eslint-disable-next-line no-undef
  const numeroActual = parseInt(localStorage.getItem("contadorFacturas")) || estado.numeroInicialFactura;

  // 2. Guardar el SIGUIENTE número para la próxima factura (¡CORREGIDO!)
  // eslint-disable-next-line no-undef
  localStorage.setItem("contadorFacturas", numeroActual + 1);

  // 3. Imprimir
  window.print();

  generarNumeroFactura();
}

// --- 4. CARGA Y PARSEO DE CLIENTES (CSV) ---
async function cargarClientesCSV () {
  try {
    const textoCSV = await window.api.leerCSV("customers.csv");
    const lineas = textoCSV.split("\n").map(l => l.trim()).filter(Boolean).slice(1); // Ignorar cabecera
    const select = document.getElementById("d-select");

    // Añadir opción por defecto
    select.innerHTML = "<option value=\"\">Seleccione un cliente...</option>";

    lineas.forEach(linea => {
      const campos = parseCSVLine(linea);
      const nombreAlias = campos[0];

      // Guardar en el diccionario (Mapa)
      estado.clientes[nombreAlias] = {
        domicilio: campos[1] || "",
        poblacion: campos[2] || "",
        nif: campos[3] || ""
      };

      // Crear <option>
      // eslint-disable-next-line no-undef
      const option = new Option(nombreAlias, nombreAlias);
      select.add(option);
    });

    // Evento al cambiar de cliente
    select.addEventListener("change", (e) => actualizarDatosClienteUI(e.target.value));
  } catch (error) {
    console.error("Error al cargar customers.csv:", error);
    // eslint-disable-next-line no-undef
    alert("No se pudo cargar la lista de clientes.");
  }
}

function actualizarDatosClienteUI (nombreSeleccionado) {
  const datos = estado.clientes[nombreSeleccionado];

  // Si no hay datos (ej: seleccionó la opción por defecto), limpia los campos
  document.getElementById("domicilio").textContent = datos ? datos.domicilio : "";
  document.getElementById("poblacion").textContent = datos ? datos.poblacion : "";
  document.getElementById("nif").textContent = datos ? datos.nif : "";
}

function parseCSVLine (linea) {
  const partes = [];
  let fragmentoActual = "";
  let dentroComillas = false;

  for (const char of linea) {
    if (char === "\"") {
      dentroComillas = !dentroComillas;
    } else if (char === "," && !dentroComillas) {
      partes.push(fragmentoActual.trim());
      fragmentoActual = "";
    } else {
      fragmentoActual += char;
    }
  }
  partes.push(fragmentoActual.trim());
  return partes;
}

// --- 5. GESTIÓN DE LA TABLA DE PRODUCTOS ---
function agregarFila () {
  const tableBody = document.getElementById("table-body");
  const row = document.createElement("tr");

  // Columna 1: Albarán y Fecha
  const tdConcepto = document.createElement("td");
  tdConcepto.innerHTML = `
        <div class="albaran-flex">
            <span>Albarán:</span>
            <input type="date" class="input-fecha-tabla" value="${new Date().toISOString().split("T")[0]}">
        </div>
    `;

  // Columna 2: Precio
  const tdPrecio = document.createElement("td");
  const divPrecio = document.createElement("div");
  divPrecio.className = "td-flex";

  const inputPrecio = document.createElement("input");
  inputPrecio.type = "number";
  inputPrecio.min = "0.00";
  inputPrecio.step = "0.01";
  inputPrecio.placeholder = "0.00";
  inputPrecio.className = "price";

  // Escuchar cambios para recalcular
  inputPrecio.addEventListener("input", recalcularTotales);

  divPrecio.appendChild(inputPrecio);
  tdPrecio.appendChild(divPrecio);

  // Añadir a la fila y luego a la tabla
  row.append(tdConcepto, tdPrecio);
  tableBody.appendChild(row);

  recalcularTotales();
}

function eliminarUltimaFila () {
  const tableBody = document.getElementById("table-body");
  if (tableBody.lastElementChild) {
    tableBody.removeChild(tableBody.lastElementChild);
    recalcularTotales();
  }
}

// --- 6. CÁLCULOS MATEMÁTICOS ---
function recalcularTotales () {
  const inputsPrecio = document.querySelectorAll(".price");
  let sumaSubtotal = 0;

  inputsPrecio.forEach(input => {
    const valorNumerico = parseFloat(input.value) || 0;
    sumaSubtotal += valorNumerico;
  });

  const iva = sumaSubtotal * 0.10; // IVA 10%
  const totalFinal = sumaSubtotal + iva;

  // Formateador de moneda profesional
  const formateadorEuros = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
  });

  document.getElementById("suma").textContent = `SUMA: ${formateadorEuros.format(sumaSubtotal)}`;
  document.getElementById("iva").textContent = `I.V.A 10%: ${formateadorEuros.format(iva)}`;
  document.getElementById("total").textContent = `TOTAL: ${formateadorEuros.format(totalFinal)}`;
}
