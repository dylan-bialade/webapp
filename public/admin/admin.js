const socket = io();
socket.emit("register-admin", "Admin");

const clientSelect = document.getElementById("clientSelect");
const remoteVideosContainer = document.getElementById("remoteVideosContainer");

const peerConnections = new Map();
const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// 🔄 Mise à jour de la liste des clients
socket.on("update-clients", clients => {
  console.log("[ADMIN] Clients connectés :", clients);
  clientSelect.innerHTML = '<option value="">-- Sélectionner un client --</option>';
  clients.forEach(([id, label]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = `${label} (${id})`;
    clientSelect.appendChild(opt);
  });
});

// 🎯 Lors de la sélection d’un client
clientSelect.addEventListener("change", () => {
  const clientId = clientSelect.value;
  if (!clientId || peerConnections.has(clientId)) return;

  const pc = new RTCPeerConnection(config);
  peerConnections.set(clientId, pc);

  pc.ontrack = (e) => {
    console.log("[ADMIN] Flux reçu");
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.srcObject = e.streams[0];
    remoteVideosContainer.appendChild(video);
  };

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("candidate", { to: clientId, candidate: e.candidate });
    }
  };

  socket.emit("request-offer", { to: clientId });
});

// 📨 Offre reçue d’un client
socket.on("offer", async ({ from, offer }) => {
  let pc = peerConnections.get(from);
  if (!pc) {
    pc = new RTCPeerConnection(config);
    peerConnections.set(from, pc);
  }

  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit("answer", { to: from, answer });

  pc.ontrack = (e) => {
    console.log("[ADMIN] Flux vidéo affiché");
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.srcObject = e.streams[0];
    remoteVideosContainer.appendChild(video);
  };

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("candidate", { to: from, candidate: e.candidate });
    }
  };
});

// ❄️ ICE Candidate reçu
socket.on("candidate", ({ from, candidate }) => {
  const pc = peerConnections.get(from);
  if (pc && candidate) {
    pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
  }
});
