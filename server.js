require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");
const bodyParser = require("body-parser");
const qrcode = require("qrcode-terminal");

const port = process.env.PORT || 3000;
const { Client, LocalAuth, GroupNotificationTypes } = require("whatsapp-web.js");
const csvjson = require("./csvjson.json");
const crearOActualizarJSON = require("./crearJson.js");
const verificaGrupo = require("./verificaGrupo.js");
const modificarEnCola = require("./modificaJson.js");
const QRCode = require("qrcode");

console.log("principal", path.join(__dirname, "./index.html"));

const HTML_DIR = path.join(__dirname, "/../");
const JSON_FILE_PATH = path.join(__dirname, "/../archivo.json");
app.use(express.static(HTML_DIR));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ruta para el archivo HTML con los inputs
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

// Ruta para obtener el archivo JSON
app.get("/data", (req, res) => {
  res.sendFile(JSON_FILE_PATH);
});

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  QRCode.toFile(
    path.join(__dirname, "/../public/code.png"),
    qr,
    {
      errorCorrectionLevel: "H",
    },
    function (err) {
      if (err) throw err;
      // console.log("QR code saved!");
      io.emit("qr", "code.png");
    }
  );

  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  // Lanzar Puppeteer en modo sin cabeza

  console.log("Cliente listo!");
});

client.on("message", (msg) => {
  const grupo = verificaGrupo(msg);

  const author = msg._data.author;
  const phoneNumber = author.split("@")[0]; // Extraer el número de teléfono del formato "56941101197@c.us"
  const contact = csvjson.find((item) => item.number == phoneNumber);

  if (grupo == "ubicacion") {
    // Buscar el número de teléfono en el archivo JSON
    console.log("contacto", contact);
    if (contact) {
      const mensaje = {
        nombre: contact.nombre,
        phoneNumber: phoneNumber,
      };

      // Emitir el mensaje recibido a todos los clientes conectados
      io.emit("newMessage", mensaje);
      crearOActualizarJSON(contact.nombre, phoneNumber);
    }
  } else if (grupo == "op") {
    modificarEnCola(phoneNumber)
      .then((resultado) => {
        if (resultado === true) {
          io.emit("cargaOp", true);
        }
      })
      .catch((error) => {
        console.error("Error al modificar en cola:", error);
      });
  }
});

// Exportar el objeto 'io' para poder utilizarlo en otros archivos
module.exports = io;

// Exportar la función 'initializeClient' para iniciar el cliente de WhatsApp
module.exports.initializeClient = () => {
  // Iniciamos el servidor en el puerto 3000
  http.listen(port, () => {
    console.log("Servidor iniciado en el puerto " + port);
    client.initialize();
  });
};
