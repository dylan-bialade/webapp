const socket = io();
let peerConnection = null;
let stream = null;
let currentFacing = "user"; // caméra frontale par défaut

console.log("[CLIENT] Initialisation du client WebRTC");

// Enregistrement avec un label
const label = prompt("Nom de l'appareil ?");
socket.emit("register-client", label || "Client");
console.log("[CLIENT] Inscrit avec le label :", label);


// Fonction pour activer caméra + micro
async function getMedia(facing = "user") {
  const constraints = {
    video: { facingMode: facing },
    audio: true,
  };

  if (stream) {
    stream.getTracks().forEach(t => t.stop());
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log("[CLIENT] Flux média obtenu");
    setupConnection();
  } catch (err) {
    console.error("[CLIENT] Erreur d’accès média:", err);
  }
}

// Connexion WebRTC de base (auto offre si pas d’admin)
function setupConnection() {
  if (peerConnection) peerConnection.close();

  peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  stream.getTracks().forEach(track => {
    peerConnection.addTrack(track, stream);
  });

  peerConnection.onicecandidate = (e) => {
    if (e.candidate) {
      console.log("[CLIENT] Envoi d’un ICE candidate");
      socket.emit("candidate", { candidate: e.candidate });
    }
  };

  peerConnection.createOffer()
    .then(offer => peerConnection.setLocalDescription(offer))
    .then(() => {
      console.log("[CLIENT] Offre envoyée au serveur");
      socket.emit("offer", peerConnection.localDescription);
    });
}

// Quand l’admin envoie une demande d’offre
socket.on("request-offer", ({ from }) => {
  if (!stream) return console.warn("[CLIENT] Pas de stream pour offrir");

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  stream.getTracks().forEach(track => {
    pc.addTrack(track, stream);
  });

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("candidate", { to: from, candidate: e.candidate });
    }
  };

  pc.createOffer()
    .then(offer => pc.setLocalDescription(offer))
    .then(() => {
      console.log("[CLIENT] Offre directe envoyée à", from);
      socket.emit("offer", { to: from, offer: pc.localDescription });
    });

  socket.on("answer", ({ from: answerFrom, answer }) => {
    if (answerFrom === from) {
      console.log("[CLIENT] Réponse reçue de", from);
      pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  });
});

socket.on("answer", ({ answer }) => {
  if (peerConnection) {
    console.log("[CLIENT] Réponse globale reçue");
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }
});

socket.on("candidate", ({ candidate }) => {
  if (peerConnection && candidate) {
    console.log("[CLIENT] ICE candidate reçu");
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
  }
});

// Inversion caméra
socket.on("switch-camera", async () => {
  currentFacing = currentFacing === "user" ? "environment" : "user";
  await getMedia(currentFacing);
});

// Activation automatique dès qu’un jeu est sélectionné
window.addEventListener("game-selected", () => {
  console.log("[CLIENT] Événement game-selected déclenché");
  getMedia(currentFacing);
});
