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

cargarCSV();
