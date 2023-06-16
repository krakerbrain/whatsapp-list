const io = require("./server"); // Importar el objeto 'io' desde el archivo 'server.js'

// Conectar al servidor Socket.IO
io.on("connection", (socket) => {
  console.log("Cliente conectado");

  // Manejar eventos del cliente, si es necesario
});

// Inicializar el cliente de WhatsApp
require("./server").initializeClient();
