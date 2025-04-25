function initJeu() {
    const gameContent = document.getElementById("gameContent");
    gameContent.innerHTML = `
        <canvas id="dinoCanvas" width="600" height="200"></canvas>
        <div>
            <span id="score">Score: 0</span>
            <button id="replay">Rejouer</button>
        </div>
    `;

    const canvas = document.getElementById("dinoCanvas");
    const ctx = canvas.getContext("2d");

    let dino, gravity, jumpForce, isJumping;
    let obstacles, obstacleSpeed;
    let score, gameRunning;
    let request;

    const scoreDisplay = document.getElementById("score");
    const replayButton = document.getElementById("replay");

    function initGame() {
        dino = {
            x: 50,
            y: canvas.height - 50,
            width: 30,
            height: 30,
            dy: 0
        };

        gravity = 1.5;
        jumpForce = 18;
        isJumping = false;

        obstacles = [];
        obstacleSpeed = 6;

        spawnObstacle();

        score = 0;
        gameRunning = true;
        scoreDisplay.textContent = "Score: 0";
        replayButton.style.display = "none";

        cancelAnimationFrame(request);
        update();
    }

    function spawnObstacle() {
        const minGap = 150;
        const heights = [canvas.height - 50, canvas.height - 80, canvas.height - 110];
        const randomY = heights[Math.floor(Math.random() * heights.length)];

        if (obstacles.length === 0 || canvas.width - obstacles[obstacles.length - 1].x >= minGap) {
            obstacles.push({
                x: canvas.width,
                y: randomY,
                width: 20,
                height: 30
            });
        }

        setTimeout(spawnObstacle, 700 + Math.random() * 600);
    }

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        dino.y += dino.dy;
        dino.dy += gravity;

        if (dino.y > canvas.height - dino.height) {
            dino.y = canvas.height - dino.height;
            dino.dy = 0;
            isJumping = false;
        }

        ctx.fillStyle = "green";
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

        ctx.fillStyle = "red";
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            obs.x -= obstacleSpeed;

            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

            if (
                dino.x < obs.x + obs.width &&
                dino.x + dino.width > obs.x &&
                dino.y < obs.y + obs.height &&
                dino.y + dino.height > obs.y
            ) {
                gameOver();
                return;
            }

            if (obs.x + obs.width < 0) {
                obstacles.splice(i, 1);
                score++;
                scoreDisplay.textContent = "Score: " + score;
            }
        }

        if (gameRunning) request = requestAnimationFrame(update);
    }

    function jump() {
        if (!isJumping) {
            dino.dy = -jumpForce;
            isJumping = true;
        }
    }

    function gameOver() {
        gameRunning = false;
        replayButton.style.display = "inline-block";
        cancelAnimationFrame(request);
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText("💥 Game Over", canvas.width / 2 - 60, 50);
    }

    document.addEventListener("keydown", e => {
        if (e.code === "Space" || e.key === " ") jump();
    });

    canvas.addEventListener("click", jump);

    canvas.addEventListener("touchstart", e => {
        e.preventDefault();
        jump();
    }, { passive: false });

    function resizeCanvas() {
        canvas.width = Math.min(600, window.innerWidth - 40);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    replayButton.addEventListener("click", initGame);

    initGame();
}

window.initJeu = initJeu;
