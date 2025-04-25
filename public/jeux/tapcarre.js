window.initJeu = function () {
  const container = document.getElementById("gameContent");
  container.innerHTML = `
    <style>
      #tapCanvas { background: #fff; display: block; margin: 0 auto; border: 2px solid #000; }
      #tapScore { text-align: center; margin-top: 10px; font-weight: bold; }
    </style>
    <canvas id="tapCanvas" width="300" height="300"></canvas>
    <div id="tapScore">🎯 Touche les carrés ! Score: 0</div>
  `;

  const canvas = document.getElementById("tapCanvas");
  const ctx = canvas.getContext("2d");
  const scoreDisplay = document.getElementById("tapScore");

  let score = 0;
  let square = { x: 0, y: 0, size: 50 };
  generateSquare();

  function generateSquare() {
    square.x = Math.random() * (canvas.width - square.size);
    square.y = Math.random() * (canvas.height - square.size);
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.fillRect(square.x, square.y, square.size, square.size);
  }

  function checkClick(x, y) {
    if (
      x >= square.x && x <= square.x + square.size &&
      y >= square.y && y <= square.y + square.size
    ) {
      score++;
      scoreDisplay.textContent = `🎯 Score: ${score}`;
      generateSquare();
    }
  }

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    checkClick(e.clientX - rect.left, e.clientY - rect.top);
  });

  canvas.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    checkClick(touch.clientX - rect.left, touch.clientY - rect.top);
  }, { passive: true });

  draw();
};
