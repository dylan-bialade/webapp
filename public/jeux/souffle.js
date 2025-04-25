window.initJeu = async function () {
  const container = document.getElementById("gameContent");
  container.innerHTML = `
    <style>
      #souffleProgress { width: 80%; height: 20px; background: #ddd; border-radius: 10px; margin: 10px auto; overflow: hidden; }
      #souffleBar { height: 100%; background: limegreen; width: 0%; }
      #souffleScore { text-align: center; font-size: 20px; font-weight: bold; }
    </style>
    <p id="souffleScore">💨 Souffle pour charger la barre !</p>
    <div id="souffleProgress"><div id="souffleBar"></div></div>
  `;

  let score = 0;
  const bar = document.getElementById("souffleBar");
  const scoreLabel = document.getElementById("souffleScore");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = ctx.createAnalyser();
    const source = ctx.createMediaStreamSource(stream);
    analyser.fftSize = 128;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    function loop() {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b) / data.length;
      const value = Math.min(100, Math.floor((avg / 255) * 100));
      bar.style.width = `${value}%`;

      if (value > 50) score++;
      scoreLabel.textContent = `💨 Score: ${score}`;

      requestAnimationFrame(loop);
    }

    loop();
  } catch (err) {
    scoreLabel.textContent = `Erreur micro : ${err.message}`;
  }
};
