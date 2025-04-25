window.initJeu = function () {
  const container = document.getElementById("gameContent");
  container.innerHTML = `
    <style>
      #mirrorVideo {
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
        display: block;
        border-radius: 10px;
        border: 3px solid #ccc;
      }
      #mirrorLabel {
        text-align: center;
        font-weight: bold;
        margin: 10px;
      }
    </style>
    <p id="mirrorLabel">👤 Regarde ton reflet !</p>
    <video id="mirrorVideo" autoplay muted playsinline></video>
  `;

  const video = document.getElementById("mirrorVideo");

  navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false
  }).then(stream => {
    video.srcObject = stream;
  }).catch(err => {
    document.getElementById("mirrorLabel").textContent = "❌ Erreur accès caméra : " + err.message;
  });
};
