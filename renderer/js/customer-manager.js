let clientes = [];
let indiceEditando = -1; // -1 significa que estamos creando uno nuevo

// 1. CARGAR DATOS AL INICIAR
async function cargarClientes () {
  try {
    const texto = await window.api.leerCSV("customers.csv");
    const lineas = texto.split("\n").map(l => l.trim()).filter(Boolean);

    clientes = []; // Limpiamos el array

    // Empezamos desde i=1 para saltar la cabecera (Nombre,D,Domicilio...)
    for (let i = 1; i < lineas.length; i++) {
      const campos = parseCSVLine(lineas[i]);
      clientes.push({
        nombre: campos[0],
        d: campos[1],
        domicilio: campos[2],
        poblacion: campos[3],
        nif: campos[4]
      });
    }
    renderizarTabla();
  } catch (error) {
    window.alert("Error al cargar los clientes.");
  }
}

// El mismo parseador robusto que ya tenías
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

// 2. MOSTRAR EN LA TABLA
function renderizarTabla () {
  const tbody = document.getElementById("clients-table-body");
  tbody.innerHTML = ""; // Limpiamos tabla

  clientes.forEach((cliente, index) => {
    const tr = document.createElement("tr");

    // Si es el que estamos editando, lo marcamos en verde
    if (index === indiceEditando) tr.classList.add("row-selected");

    tr.innerHTML = `
            <td><strong>${cliente.nombre}</strong></td>
            <td>${cliente.d}</td>
            <td>${cliente.poblacion}</td>
        `;

    // Al hacer clic en un cliente, lo cargamos en el formulario
    tr.addEventListener("click", () => cargarEnFormulario(index));
    tbody.appendChild(tr);
  });
}

// 3. PASAR DATOS AL FORMULARIO
function cargarEnFormulario (index) {
  indiceEditando = index;
  const cliente = clientes[index];

  document.getElementById("form-title").textContent = "✏️ Editando Cliente";
  document.getElementById("input-nombre").value = cliente.nombre;
  document.getElementById("input-d").value = cliente.d;
  document.getElementById("input-domicilio").value = cliente.domicilio;
  document.getElementById("input-poblacion").value = cliente.poblacion;
  document.getElementById("input-nif").value = cliente.nif;

  // Mostramos el botón de borrar
  document.getElementById("btn-delete").style.display = "block";
  renderizarTabla(); // Refrescar para pintar la fila verde
}

// 4. LIMPIAR FORMULARIO (Para crear uno nuevo)
document.getElementById("btn-clear").addEventListener("click", () => {
  indiceEditando = -1;
  document.getElementById("form-title").textContent = "✨ Nuevo Cliente";
  document.getElementById("input-nombre").value = "";
  document.getElementById("input-d").value = "";
  document.getElementById("input-domicilio").value = "";
  document.getElementById("input-poblacion").value = "";
  document.getElementById("input-nif").value = "";
  document.getElementById("btn-delete").style.display = "none";
  renderizarTabla();
});

// 5. GUARDAR Y REESCRIBIR CSV
document.getElementById("btn-save").addEventListener("click", async () => {
  const btnSave = document.getElementById("btn-save");

  // Recoger datos
  const nuevoCliente = {
    nombre: document.getElementById("input-nombre").value.trim(),
    d: document.getElementById("input-d").value.trim(),
    domicilio: document.getElementById("input-domicilio").value.trim(),
    poblacion: document.getElementById("input-poblacion").value.trim(),
    nif: document.getElementById("input-nif").value.trim()
  };

  if (!nuevoCliente.nombre) {
    window.alert("El Nombre Corto es obligatorio para buscarlo luego.");
    return;
  }

  // Actualizar array
  if (indiceEditando === -1) {
    clientes.push(nuevoCliente); // Añadir nuevo
  } else {
    clientes[indiceEditando] = nuevoCliente; // Sobrescribir existente
  }

  // --- MAGIA VISUAL (En vez de usar alert) ---
  const textoOriginal = btnSave.innerHTML;
  btnSave.innerHTML = "⏳ Guardando...";
  btnSave.disabled = true; // Bloqueamos el botón un segundo para evitar doble clic

  await guardarDatosEnArchivo();

  // Mostramos al cliente que todo ha ido bien directamente en el botón
  btnSave.innerHTML = "✅ ¡Guardado!";
  btnSave.style.backgroundColor = "#28a745"; // Verde más oscuro

  // Esperamos 1.5 segundos y reiniciamos el panel
  setTimeout(() => {
    btnSave.innerHTML = textoOriginal;
    btnSave.style.backgroundColor = "#4CAF50"; // Verde original
    btnSave.disabled = false;

    // Vaciamos el formulario para evitar bloqueos y dejarlo listo
    document.getElementById("btn-clear").click();
  }, 1500);
});

// 6. ELIMINAR CLIENTE
document.getElementById("btn-delete").addEventListener("click", async () => {
  if (window.confirm("¿Seguro que quieres borrar a este cliente para siempre?")) {
    clientes.splice(indiceEditando, 1); // Borrar del array
    document.getElementById("btn-clear").click(); // Limpiar formulario
    await guardarDatosEnArchivo();
  }
});

// 7. FUNCIÓN MAESTRA: CONVERTIR A CSV Y GUARDAR
async function guardarDatosEnArchivo () {
  // Hemos mejorado el escapado por si algún campo está vacío accidentalmente
  const escapar = (texto) => {
    if (!texto) return ""; // Si está vacío, devuelve nada
    return texto.includes(",") ? `"${texto}"` : texto;
  };

  let csvContent = "Nombre,D,Domicilio,Poblacion,NIF\n"; // Cabecera obligatoria

  clientes.forEach(c => {
    const fila = [
      escapar(c.nombre),
      escapar(c.d),
      escapar(c.domicilio),
      escapar(c.poblacion),
      escapar(c.nif)
    ].join(","); // Unir con comas

    csvContent += fila + "\n";
  });

  // Enviar a main.js para guardar
  const resultado = await window.api.guardarCSV("customers.csv", csvContent);

  if (!resultado.success) {
    // Solo lanzamos alert si hay un error crítico (ej: Archivo abierto en Excel)
    window.alert("❌ Error al guardar el archivo. ¿Lo tienes abierto en otra pantalla?");
  }

  renderizarTabla(); // Actualizamos la vista de la izquierda
}

// Arrancar la aplicación cargando los clientes
cargarClientes();
