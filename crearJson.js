const fs = require("fs");

function crearOActualizarJSON(nombre, phoneNumber) {
  const data = {
    fecha: new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" }),
    nombre: nombre,
    telefono: phoneNumber,
    enCola: true,
  };
  let existingData = [];
  try {
    if (fs.existsSync("archivo.json")) {
      const fileContent = fs.readFileSync("archivo.json", "utf-8");
      if (fileContent.trim().length > 0) {
        existingData = JSON.parse(fileContent);
      }
    }
  } catch (error) {
    console.error("Error al leer el archivo JSON:", error);
    return;
  }

  existingData.push(data);

  const jsonData = JSON.stringify(existingData, null, 2);

  fs.writeFileSync("archivo.json", jsonData);

  console.log("Datos agregados al archivo JSON exitosamente.");
}

module.exports = crearOActualizarJSON;
