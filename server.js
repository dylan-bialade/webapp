// server.js
const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const ngrok = require("./ngrok");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const clients = new Map();   // socket.id → label
const admins = new Set();    // socket.id pour les admin

// 1) statique
app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", express.static(path.join(__dirname, "public/admin")));
app.use("/jeux", express.static(path.join(__dirname, "public/jeux")));

// 2) API pour lister dynamiquement les jeux
app.get("/api/jeux", (req, res) => {
  const dir = path.join(__dirname, "public/jeux");
  const list = fs.readdirSync(dir)
    .filter(f => f.endsWith(".js"))
    .map(f => f.replace(/\.js$/, ""));
  res.json(list);
});

// 3) page admin
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/admin.html"));
});

// 4) WebSocket signaling
io.on("connection", socket => {
  console.log("🔌 Socket connect:", socket.id);

  // Enregistrement d'un client
  socket.on("register-client", label => {
    clients.set(socket.id, label || "Appareil");
    updateClients();
  });

  // Enregistrement d'un admin
  socket.on("register-admin", label => {
    admins.add(socket.id);
    updateClients();
  });

  // Déconnexion d'un client
  socket.on("disconnect", () => {
    clients.delete(socket.id);
    admins.delete(socket.id);
    updateClients();
  });

  // Envoi de l'offre à un client spécifique
  socket.on("request-offer", ({ to }) => {
    io.to(to).emit("request-offer", { from: socket.id });
  });

  // Envoi d'une offre au serveur
  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  // Réponse d'un client
  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  // Envoi des candidats ICE
  socket.on("candidate", ({ to, candidate }) => {
    io.to(to).emit("candidate", { from: socket.id, candidate });
  });

  // Changement de caméra (envoyé à un client)
  socket.on("switch-camera", ({ to }) => {
    io.to(to).emit("switch-camera");
  });

  // Mise à jour de la liste des clients
  function updateClients() {
    const list = [...clients.entries()]; // [ [id,label], … ]
    admins.forEach(adminId => {
      io.to(adminId).emit("update-clients", list);
    });
  }
});

// 5) Lancer le serveur
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  ngrok();
});
