async function cargarCSV () {
  const texto = await window.api.leerCSV("customers.csv");

  const lineas = texto.split("\n").map(l => l.trim()).filter(Boolean).slice(1);

  const select = document.getElementById("d-select");

  lineas.forEach(linea => {
    const option = document.createElement("option");

    option.value = linea.split(",")[0];
    option.textContent = linea.split(",")[0];
    select.appendChild(option);
  });

  select.addEventListener("change", () => {
    lineas.forEach(linea => {
      const campos = parseCSVLine(linea);
      const nombre = campos[0];

      if (select.value === nombre) {
        document.getElementById("domicilio").textContent = campos[1];
        document.getElementById("poblacion").textContent = campos[2];
        document.getElementById("nif").textContent = campos[3];
      }
    });
  });
}

function parseCSVLine (linea) {
  const partes = [];
  let actual = "";
  let dentroDeComillas = false;

  for (const c of linea) {
    if (c === "\"") {
      dentroDeComillas = !dentroDeComillas;
    } else if (c === "," && !dentroDeComillas) {
      partes.push(actual.trim());
      actual = "";
    } else {
      actual += c;
    }
  }

  partes.push(actual.trim());
  return partes;
}

function addButton () {
  const button = document.getElementById("add-button");
  const tableBody = document.getElementById("table-body");

  button.addEventListener("click", () => {
    const row = document.createElement("tr");

    // COLUMN 1 (fecha)
    const column1 = document.createElement("td");
    const tdContent1 = document.createElement("div");
    tdContent1.classList.add("td-flex");

    const dateInput = document.createElement("input");
    dateInput.type = "date";

    tdContent1.append("Albarán ", dateInput);
    column1.append(tdContent1);

    // COLUMN 2 (precio)
    const column2 = document.createElement("td");
    const tdContent2 = document.createElement("div");
    tdContent2.classList.add("td-flex");

    const priceInput = document.createElement("input");
    priceInput.type = "number";
    priceInput.min = "0.00";
    priceInput.max = "10000.00";
    priceInput.step = "0.01";
    priceInput.classList.add("price");

    // Cuando el precio cambie → recalcular automáticamente
    priceInput.addEventListener("input", calcTotal);
    priceInput.value = Number(priceInput.value).toFixed(2);

    tdContent2.append(priceInput);
    column2.append(tdContent2);

    // Añadir columnas a la fila
    row.append(column1, column2);
    tableBody.append(row);

    // Recalcular después de añadir nueva fila
    calcTotal();
  });
}

function removeButton () {
  const button = document.getElementById("remove-button");
  const tableBody = document.getElementById("table-body");

  button.addEventListener("click", () => {
    const lastRow = tableBody.lastElementChild;
    if (!lastRow) return;

    tableBody.removeChild(lastRow);
    calcTotal();
  });
}

function calcTotal () {
  const precios = document.querySelectorAll(".price");

  let suma = 0;

  precios.forEach(input => {
    const valor = parseFloat(input.value);
    if (!isNaN(valor)) suma += valor;
  });

  const iva = suma * 0.10;
  const total = suma + iva;

  document.getElementById("suma").textContent = "SUMA: " + suma.toFixed(2) + "€";
  document.getElementById("iva").textContent = "I.V.A 10%: " + iva.toFixed(2) + "€";
  document.getElementById("total").textContent = "TOTAL: " + total.toFixed(2) + "€";
}

addButton();
removeButton();
cargarCSV();
