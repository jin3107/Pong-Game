const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

let WIDTH = canvas.width;
let HEIGHT = canvas.height;

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 14;
const PADDLE_MARGIN = 10;

const player = {
  x: PADDLE_MARGIN,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,    
  height: PADDLE_HEIGHT,
  color: '#fff',
};

const ai = {
  x: WIDTH - PADDLE_WIDTH - PADDLE_MARGIN,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  color: '#fff',
  speed: 3.2,
};

const ball = {
  x: WIDTH / 2 - BALL_SIZE / 2,
  y: HEIGHT / 2 - BALL_SIZE / 2,
  size: BALL_SIZE,
  speed: 4,
  dx: 4,
  dy: 4,
  color: '#ffeb3b',
};

let playerScore = 0;
let aiScore = 0;
let gameOver = false;
let winner = "";
let flash = false;
let flashInterval = null;

function drawPaddle(paddle) {
  ctx.fillStyle = paddle.color;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall(ball) {
  ctx.fillStyle = ball.color;
  ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
}

function drawCenterLine() {
  ctx.strokeStyle = '#fff4';
  ctx.setLineDash([8, 16]);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawLabels() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("PLAYER", WIDTH / 4, 22);
  ctx.fillText("COMPUTER", 3 * WIDTH / 4, 22);
}

function drawScores() {
  ctx.font = "32px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(playerScore, WIDTH / 4, 62);
  ctx.fillText(aiScore, 3 * WIDTH / 4, 62);
}

function drawWinMessage() {
  ctx.font = "bold 44px Arial";
  ctx.fillStyle = flash ? "#ffeb3b" : "#fff";
  ctx.textAlign = "center";
  ctx.fillText(`${winner} WINS!`, WIDTH / 2, HEIGHT / 2);
  ctx.font = "24px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Click to restart", WIDTH / 2, HEIGHT / 2 + 48);
}

function resetBall(direction = 1) {
  ball.x = WIDTH / 2 - BALL_SIZE / 2;
  ball.y = HEIGHT / 2 - BALL_SIZE / 2;
  ball.dx = direction * ball.speed * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = ball.speed * (Math.random() * 2 - 1);
}

function resetGame() {
  playerScore = 0;
  aiScore = 0;
  gameOver = false;
  winner = "";
  if (flashInterval) clearInterval(flashInterval);
  document.body.style.background = "#20262e";
  resetBall();
  gameLoop();
}

function update() {
  if (gameOver) return;

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.y < 0) {
    ball.y = 0;
    ball.dy = -ball.dy;
  }
  if (ball.y + ball.size > HEIGHT) {
    ball.y = HEIGHT - ball.size;
    ball.dy = -ball.dy;
  }

  if (
    ball.x < player.x + player.width &&
    ball.x + ball.size > player.x &&
    ball.y < player.y + player.height &&
    ball.y + ball.size > player.y
  ) {
    ball.x = player.x + player.width; 
    ball.dx = Math.abs(ball.dx);
    const hitPos = (ball.y + ball.size / 2 - (player.y + player.height / 2)) / (player.height / 2);
    ball.dy = ball.speed * hitPos;
  }

  if (
    ball.x + ball.size > ai.x &&
    ball.x < ai.x + ai.width &&
    ball.y < ai.y + ai.height &&
    ball.y + ball.size > ai.y
  ) {
    ball.x = ai.x - ball.size;
    ball.dx = -Math.abs(ball.dx);
    const hitPos = (ball.y + ball.size / 2 - (ai.y + ai.height / 2)) / (ai.height / 2);
    ball.dy = ball.speed * hitPos;
  }

  if (ball.x < 0) {
    aiScore++;
    if (aiScore >= 10) {
      winner = "COMPUTER";
      gameOver = true;
      startFlash();
      return;
    }
    resetBall(direction = 1);
  }
  if (ball.x + ball.size > WIDTH) {
    playerScore++;
    if (playerScore >= 10) {
      winner = "PLAYER";
      gameOver = true;
      startFlash();
      return;
    }
    resetBall(direction = -1);
  }

  if (ball.y + ball.size / 2 < ai.y + ai.height / 2) {
    ai.y -= ai.speed;
  } else if (ball.y + ball.size / 2 > ai.y + ai.height / 2) {
    ai.y += ai.speed;
  }
  ai.y = Math.max(0, Math.min(HEIGHT - ai.height, ai.y));
}

function startFlash() {
  flash = false;
  flashInterval = setInterval(() => {
    flash = !flash;
    document.body.style.background = flash ? "#ffeb3b" : "#20262e";
  }, 200);
}

function render() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawCenterLine();
  drawLabels();
  drawPaddle(player);
  drawPaddle(ai);
  drawBall(ball);
  drawScores();
  if (gameOver) {
    drawWinMessage();
  }
}

function gameLoop() {
  if (!gameOver) {
    update();
    render();
    requestAnimationFrame(gameLoop);
  } else {
    render();
  }
}

function resizeCanvas() {
  let w = window.innerWidth;
  let h = window.innerHeight;
  if (w / h > 16 / 9) {
    w = h * 16 / 9;
  } else {
    h = w * 9 / 16;
  }
  canvas.width = w * 0.98;
  canvas.height = h * 0.7;
  updateConstants();
  resetBall();
}
function updateConstants() {
  WIDTH = canvas.width;
  HEIGHT = canvas.height;
  player.y = HEIGHT / 2 - player.height / 2;
  ai.x = WIDTH - ai.width - PADDLE_MARGIN;
  ai.y = HEIGHT / 2 - ai.height / 2;
}

canvas.addEventListener('touchmove', function (e) {
  if (gameOver) return;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const touchY = touch.clientY - rect.top;
  player.y = touchY - player.height / 2;
  player.y = Math.max(0, Math.min(HEIGHT - player.height, player.y));
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('mousemove', function (e) {
  if (gameOver) return;
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  player.y = mouseY - player.height / 2;
  player.y = Math.max(0, Math.min(HEIGHT - player.height, player.y));
});

canvas.addEventListener('click', function () {
  if (gameOver) {
    if (flashInterval) clearInterval(flashInterval);
    document.body.style.background = "#20262e";
    resetGame();
  }
});

window.addEventListener('resize', resizeCanvas);

resizeCanvas();

resetBall();
gameLoop();