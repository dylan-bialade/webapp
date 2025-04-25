window.initJeu = function () {
  const container = document.getElementById("gameContent");
  container.innerHTML = `
    <style>
      #brosseCanvas { background: #f8f8f8; display: block; margin: 0 auto; border: 2px solid #ccc; }
      #brosseScore { font-size: 18px; margin-top: 10px; text-align: center; font-weight: bold; }
    </style>
    <canvas id="brosseCanvas" width="300" height="300"></canvas>
    <div id="brosseScore">🪥 Brossez les dents !</div>
  `;

  const canvas = document.getElementById("brosseCanvas");
  const ctx = canvas.getContext("2d");
  let brushing = false, score = 0, timeLeft = 10, brushSize = 20, gameActive = true;

  function drawMouth() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(50, 120, 200, 60);
    ctx.strokeStyle = "#aaa";
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(50 + i * 33, 120);
      ctx.lineTo(50 + i * 33, 180);
      ctx.stroke();
    }
  }

  function handleBrush(x, y) {
    if (!gameActive) return;
    ctx.fillStyle = "#00bfff";
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
    ctx.fill();
    score++;
    document.getElementById("brosseScore").textContent = `🪥 Score: ${score}`;
  }

  function endGame() {
    gameActive = false;
    document.getElementById("brosseScore").textContent = `🪥 Terminé ! Score final: ${score}`;
  }

  function startGame() {
    drawMouth();
    const interval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(interval);
        endGame();
      }
    }, 1000);
  }

  canvas.addEventListener("mousedown", () => brushing = true);
  canvas.addEventListener("mouseup", () => brushing = false);
  canvas.addEventListener("mousemove", e => {
    if (!brushing) return;
    const rect = canvas.getBoundingClientRect();
    handleBrush(e.clientX - rect.left, e.clientY - rect.top);
  });

  canvas.addEventListener("touchstart", (e) => {
    brushing = true;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    handleBrush(touch.clientX - rect.left, touch.clientY - rect.top);
  }, { passive: false });

  canvas.addEventListener("touchmove", (e) => {
    if (!brushing) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    handleBrush(touch.clientX - rect.left, touch.clientY - rect.top);
  }, { passive: false });

  canvas.addEventListener("touchend", () => brushing = false);

  startGame();
};
