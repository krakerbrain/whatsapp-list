require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");
const bodyParser = require("body-parser");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

const port = process.env.PORT || 3000;
const { Client, LocalAuth, GroupNotificationTypes } = require("whatsapp-web.js");
const csvjson = require("./csvjson.json");
const crearOActualizarJSON = require("./crearJson.js");
const verificaGrupo = require("./verificaGrupo.js");
const modificarEnCola = require("./modificaJson.js");
const QRCode = require("qrcode");

// Directorio de archivos estáticos
const PUBLIC_DIR = path.join(__dirname, "public");
const QR_CODE_DIR = path.join(PUBLIC_DIR, "qrcode");

app.use(express.static(PUBLIC_DIR));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ruta para el archivo HTML con los inputs
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// Ruta para obtener el archivo JSON
app.get("/data", (req, res) => {
  res.sendFile(path.join(__dirname, "archivo.json"));
});

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  const qrCodeFilePath = path.join(QR_CODE_DIR, "code.png");

  QRCode.toFile(
    qrCodeFilePath,
    qr,
    {
      errorCorrectionLevel: "H",
    },
    function (err) {
      if (err) throw err;

      io.emit("qr", "qrcode/code.png");
    }
  );

  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("Cliente listo!");
});

client.on("message", (msg) => {
  const grupo = verificaGrupo(msg);

  const author = msg._data.author;
  const phoneNumber = author.split("@")[0];
  const contact = csvjson.find((item) => item.number == phoneNumber);

  if (grupo === "ubicacion") {
    console.log("contacto", contact);
    if (contact) {
      const mensaje = {
        nombre: contact.nombre,
        phoneNumber: phoneNumber,
      };

      io.emit("newMessage", mensaje);
      crearOActualizarJSON(contact.nombre, phoneNumber);
    }
  } else if (grupo === "op") {
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

module.exports = io;

module.exports.initializeClient = () => {
  // Crear directorio para los códigos QR si no existe
  if (!fs.existsSync(QR_CODE_DIR)) {
    fs.mkdirSync(QR_CODE_DIR, { recursive: true });
  }

  http.listen(port, () => {
    console.log("Servidor iniciado en el puerto " + port);
    client.initialize();
  });
};
