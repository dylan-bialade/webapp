window.initJeu = async function () {
  const container = document.getElementById("gameContent");
  container.innerHTML = `
    <style>
      #criScore { font-size: 20px; font-weight: bold; text-align: center; margin: 10px; }
      #volumeBar { width: 80%; height: 20px; background: #eee; margin: 10px auto; border: 2px solid #ccc; border-radius: 10px; overflow: hidden; }
      #volumeLevel { height: 100%; background: #f00; width: 0%; }
    </style>
    <div id="criScore">🎤 Score: 0</div>
    <div id="volumeBar"><div id="volumeLevel"></div></div>
    <p style="text-align: center;">Crie le plus fort possible pendant 10 secondes !</p>
  `;

  let score = 0, gameRunning = true;
  const volumeLevel = document.getElementById("volumeLevel");
  const criScore = document.getElementById("criScore");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);

    const timer = setInterval(() => {
      if (--gameRunning <= 0) {
        clearInterval(timer);
        stream.getTracks().forEach(t => t.stop());
        criScore.textContent = `🎉 Terminé ! Score final: ${score}`;
        gameRunning = false;
      }
    }, 1000);

    function updateVolume() {
      if (!gameRunning) return;
      analyser.getByteFrequencyData(dataArray);
      let volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
      let normalized = Math.min(100, Math.floor((volume / 256) * 100));
      score += normalized;
      volumeLevel.style.width = normalized + "%";
      criScore.textContent = `🎤 Score: ${score}`;
      requestAnimationFrame(updateVolume);
    }

    updateVolume();
  } catch (err) {
    criScore.textContent = `❌ Erreur micro : ${err.message}`;
  }
};
