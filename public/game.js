const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;

let player1 = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    score: 0,
    lives: 5,
    color: 'white'
};

let player2 = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    score: 0,
    lives: 5,
    color: 'white'
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 2,
    dy: 2
};

const hitSound = new Howl({
    src: ['hit.wav']
});

const scoreSound = new Howl({
    src: ['score.wav']
});

const victorySound = new Howl({
    src: ['victory.wav']
});

let paddleColor = '#ffffff';
let ballColor = '#ffffff';
let trainingMode = false;
let hardMode = false;
let powerUps = [];
let controls = {
    player1Up: 'w',
    player1Down: 's',
    player2Up: 'ArrowUp',
    player2Down: 'ArrowDown'
};

let currentLanguage = 'en';
let translations = {};

async function loadTranslations(lang) {
    const response = await fetch(`locales/${lang}.json`);
    translations = await response.json();
    updateUI();
}

function updateUI() {
    document.getElementById('menuTitle').textContent = translations.menu.title;
    document.getElementById('soloButton').textContent = translations.menu.solo;
    document.getElementById('multiButton').textContent = translations.menu.multi;
    document.getElementById('trainingButton').textContent = translations.menu.training;
}

loadTranslations(currentLanguage);

document.getElementById('paddleColor').addEventListener('input', (e) => {
    paddleColor = e.target.value;
});

document.getElementById('ballColor').addEventListener('input', (e) => {
    ballColor = e.target.value;
});

function drawPaddle(x, y, color) {
    ctx.fillStyle = paddleColor;
    ctx.beginPath();
    ctx.rect(x, y, paddleWidth, paddleHeight);
    ctx.fill();
}

function drawBall(x, y) {
    ctx.fillStyle = ballColor;
    ctx.beginPath();
    ctx.arc(x, y, ballSize, 0, Math.PI * 2);
    ctx.fill();
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle(player1.x, player1.y, player1.color);
    drawPaddle(player2.x, player2.y, player2.color);
    drawBall(ball.x, ball.y);

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y + ballSize > canvas.height || ball.y < 0) {
        ball.dy = -ball.dy;
        hitSound.play();
    }

    if (ball.x + ballSize > canvas.width) {
        if (ball.y > player2.y && ball.y < player2.y + paddleHeight) {
            ball.dx = -ball.dx;
            hitSound.play();
            player2.color = '#' + Math.floor(Math.random()*16777215).toString(16);
        } else {
            player1.score++;
            if (player1.score >= 15) {
                alert('Player 1 wins!');
                victorySound.play();
                resetGame();
            } else {
                player2.lives--;
                if (player2.lives <= 0) {
                    alert('Player 1 wins!');
                    victorySound.play();
                    resetGame();
                } else {
                    resetBall();
                    scoreSound.play();
                }
            }
        }
    }

    if (ball.x < 0) {
        if (ball.y > player1.y && ball.y < player1.y + paddleHeight) {
            ball.dx = -ball.dx;
            hitSound.play();
            player1.color = '#' + Math.floor(Math.random()*16777215).toString(16);
        } else {
            player2.score++;
            if (player2.score >= 15) {
                alert('Player 2 wins!');
                victorySound.play();
                resetGame();
            } else {
                player1.lives--;
                if (player1.lives <= 0) {
                    alert('Player 2 wins!');
                    victorySound.play();
                    resetGame();
                } else {
                    resetBall();
                    scoreSound.play();
                }
            }
        }
    }

    powerUps.forEach(powerUp => {
        if (ball.x < powerUp.x + 20 && ball.x + ballSize > powerUp.x &&
            ball.y < powerUp.y + 20 && ball.y + ballSize > powerUp.y) {
            if (powerUp.type === 'speed') {
                ball.dx *= 1.5;
                ball.dy *= 1.5;
            } else if (powerUp.type === 'size') {
                paddleHeight *= 1.5;
            }
            powerUps = powerUps.filter(p => p !== powerUp);
        }
    });

    document.getElementById('player1Score').textContent = player1.score;
    document.getElementById('player2Score').textContent = player2.score;
    document.getElementById('player1Lives').textContent = player1.lives;
    document.getElementById('player2Lives').textContent = player2.lives;

    if (trainingMode) {
        // Disable scoring and lives logic
    }

    if (hardMode) {
        ball.dx *= 1.001;
        ball.dy *= 1.001;
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = -ball.dx;
}

function resetGame() {
    player1.score = 0;
    player2.score = 0;
    player1.lives = 5;
    player2.lives = 5;
    player1.color = 'white';
    player2.color = 'white';
    resetBall();
}

document.addEventListener('keydown', (e) => {
    if (e.key === controls.player1Up) {
        player1.y -= 20;
    } else if (e.key === controls.player1Down) {
        player1.y += 20;
    }
    if (e.key === controls.player2Up) {
        player2.y -= 20;
    } else if (e.key === controls.player2Down) {
        player2.y += 20;
    }
});

canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    if (touch.clientX < canvas.width / 2) {
        player1.y = touch.clientY - paddleHeight / 2;
    } else {
        player2.y = touch.clientY - paddleHeight / 2;
    }
});

canvas.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (touch.clientX < canvas.width / 2) {
        player1.y = touch.clientY - paddleHeight / 2;
    } else {
        player2.y = touch.clientY - paddleHeight / 2;
    }
});

document.getElementById('soloButton').addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
    setInterval(update, 1000 / 60);
});

document.getElementById('multiButton').addEventListener('click', () => {
    document.getElementById('multiMenu').style.display = 'block';
});

document.getElementById('trainingButton').addEventListener('click', () => {
    trainingMode = true;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
    setInterval(update, 1000 / 60);
});

document.getElementById('hardModeButton').addEventListener('click', () => {
    hardMode = true;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
    setInterval(update, 1000 / 60);
});

document.getElementById('createGameButton').addEventListener('click', () => {
    socket.emit('createGame');
});

document.getElementById('joinGameButton').addEventListener('click', () => {
    const code = document.getElementById('joinGameInput').value;
    socket.emit('joinGame', code);
});

socket.on('gameCreated', (code) => {
    alert(`Partie créée avec le code: ${code}`);
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
});

socket.on('gameJoined', () => {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
});

setInterval(update, 1000 / 60);
