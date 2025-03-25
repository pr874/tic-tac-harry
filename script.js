const board = document.getElementById("gameBoard");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const singlePlayerBtn = document.getElementById("singlePlayerBtn");
const twoPlayerBtn = document.getElementById("twoPlayerBtn");
const gameArea = document.getElementById("gameArea");
const modeSelection = document.getElementById("modeSelection");

const PLAYER_X = "🧙‍♂️"; // Player X
const PLAYER_O = "☠️"; // Player O
let currentPlayer = PLAYER_X;
let boardState = ["", "", "", "", "", "", "", "", ""];
let isSinglePlayer = false;

// Winning patterns
const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Create an audio object for the Harry Potter theme
const gameSound = new Audio('sounds/harry_potter_theme.mp3');  // Path to the audio file
gameSound.loop = true;  // Loop the music

// Create an audio object for the click sound
const moveSound = new Audio('sounds/click.wav');  // Path to the click sound file

// Mode selection setup
singlePlayerBtn.addEventListener("click", () => startGame(true));
twoPlayerBtn.addEventListener("click", () => startGame(false));

function startGame(singlePlayerMode) {
    isSinglePlayer = singlePlayerMode;
    modeSelection.style.display = "none";
    gameArea.style.display = "block";
    createBoard();
    statusText.textContent = isSinglePlayer ? "Your turn, Player 🧙‍♂️" : "Player 🧙‍♂️'s turn";

    // Play the theme music
    gameSound.play();
}

// Create the game board
function createBoard() {
    board.innerHTML = "";
    boardState.fill("");
    currentPlayer = PLAYER_X;

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.addEventListener("click", handleCellClick);
        board.appendChild(cell);
    }
}

// Handle player moves
function handleCellClick(e) {
    const cell = e.target;
    const index = cell.dataset.index;

    if (boardState[index] !== "" || checkWinner()) return;

    boardState[index] = currentPlayer;
    cell.textContent = currentPlayer;

    // Play move sound
    moveSound.play(); // Play the click sound when the player makes a move

    // Check for winner
    if (checkWinner()) {
        statusText.textContent = `✨ Player ${currentPlayer} wins! ✨`;
        animateWin();
        return;
    }

    // Check for draw
    if (boardState.every(cell => cell !== "")) {
        statusText.textContent = "⚡ It's a draw!";
        return;
    }

    // Switch turns
    if (isSinglePlayer && currentPlayer === PLAYER_X) {
        currentPlayer = PLAYER_O;
        statusText.textContent = "🤖 AI's turn...";
        setTimeout(aiMove, 700);
    } else {
        currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
        statusText.textContent = `Player ${currentPlayer}'s turn`;
    }
}

// AI Move logic
function aiMove() {
    let bestMove = getBestMove();
    boardState[bestMove] = PLAYER_O;
    document.querySelector(`.cell[data-index="${bestMove}"]`).textContent = PLAYER_O;

    if (checkWinner()) {
        statusText.textContent = "☠️ The AI wins! Evil prevails... ☠️";
        animateWin();
    } else if (boardState.every(cell => cell !== "")) {
        statusText.textContent = "⚡ It's a draw!";
    } else {
        currentPlayer = PLAYER_X;
        statusText.textContent = "🧙‍♂️ Your turn!";
    }
}

// Minimax Algorithm (Perfect AI Play)
function getBestMove() {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === "") {
            boardState[i] = PLAYER_O;
            let score = minimax(boardState, 0, false, -Infinity, Infinity);
            boardState[i] = "";

            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(boardState, depth, isMaximizing, alpha, beta) {
    if (checkWinner()) return isMaximizing ? -10 : 10;
    if (boardState.every(cell => cell !== "")) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === "") {
                boardState[i] = PLAYER_O;
                let score = minimax(boardState, depth + 1, false, alpha, beta);
                boardState[i] = "";
                bestScore = Math.max(score, bestScore);
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) break;
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === "") {
                boardState[i] = PLAYER_X;
                let score = minimax(boardState, depth + 1, true, alpha, beta);
                boardState[i] = "";
                bestScore = Math.min(score, bestScore);
                beta = Math.min(beta, bestScore);
                if (beta <= alpha) break;
            }
        }
        return bestScore;
    }
}

// Check if someone has won
function checkWinner() {
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            document.querySelector(`.cell[data-index="${a}"]`).classList.add("win");
            document.querySelector(`.cell[data-index="${b}"]`).classList.add("win");
            document.querySelector(`.cell[data-index="${c}"]`).classList.add("win");
            return true;
        }
    }
    return false;
}

// Animate the win
function animateWin() {
    setTimeout(() => {
        document.querySelectorAll(".cell.win").forEach(cell => {
            cell.style.backgroundColor = "#ffdd44";
        });
    }, 300);
}

// Restart the game
restartBtn.addEventListener("click", () => {
    gameArea.style.display = "none";
    modeSelection.style.display = "block";
    boardState = ["", "", "", "", "", "", "", "", ""];
    gameSound.pause();  // Stop the music when restarting
    gameSound.currentTime = 0;  // Reset to the beginning
});
