const fs = require("fs");

function modificarEnCola(telefono) {
  return new Promise((resolve, reject) => {
    console.log(telefono);
    // Leer el archivo JSON
    fs.readFile("archivo.json", "utf8", (error, data) => {
      if (error) {
        console.error("Error al leer el archivo JSON:", error);
        reject(error);
        return;
      }

      try {
        // Parsear el contenido JSON a un objeto JavaScript
        const datos = JSON.parse(data);

        const options = { year: "numeric", month: "2-digit", day: "2-digit" };
        const today = new Date().toLocaleDateString("es-CL", options).replace(/\//g, "-");
        const objetoEncontrado = datos.find((objeto) => objeto.telefono === telefono && today === formatDate(objeto.fecha));
        if (objetoEncontrado !== undefined) {
          objetoEncontrado.enCola = false;

          // Convertir el objeto modificado a formato JSON
          const datosModificados = JSON.stringify(datos);

          // Escribir los datos modificados en el archivo JSON
          fs.writeFile("archivo.json", datosModificados, "utf8", (error) => {
            if (error) {
              console.error("Error al escribir en el archivo JSON:", error);
              reject(error);
              return;
            }
            console.log("El objeto con el teléfono", telefono, "ha sido modificado y guardado en el archivo JSON.");
            resolve(true);
          });
        } else {
          console.log("El objeto con el teléfono", telefono, "no fue encontrado en el archivo JSON.");
          resolve(false);
        }
      } catch (error) {
        console.error("Error al parsear el contenido JSON:", error);
        reject(error);
      }
    });
  });
}

// Función auxiliar para formatear la fecha
function formatDate(date) {
  const parts = date.split(" ")[0];
  console.log(parts);

  return parts;
}

module.exports = modificarEnCola;
