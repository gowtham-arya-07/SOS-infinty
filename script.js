// This line proves JS is loaded
console.log("SOS Game JS Loaded");

let board = [];
let size = 5;
let players = [];
let scores = [];
let currentPlayer = 0;
let isComputer = false;
let gameOver = false;

function startGame() {
  size = parseInt(document.getElementById("size").value);
  let mode = parseInt(document.getElementById("mode").value);

  players = [];
  scores = [];
  gameOver = false;

  if (mode === 1) {
    players = ["Player", "Computer"];
    isComputer = true;
  } else {
    isComputer = false;
    for (let i = 1; i <= mode; i++) {
      players.push("Player " + i);
    }
  }

  for (let i = 0; i < players.length; i++) scores.push(0);

  currentPlayer = 0;
  board = Array(size).fill().map(() => Array(size).fill(""));

  drawBoard();
  updateScores();
  updateTurn();
  document.getElementById("winner").innerText = "";
}

function drawBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";
  boardDiv.style.gridTemplateColumns = `repeat(${size}, 60px)`;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const btn = document.createElement("button");
      btn.className = "cell";
      btn.dataset.r = r;
      btn.dataset.c = c;
      btn.onclick = function() {
        playMove(r, c);
      };
      boardDiv.appendChild(btn);
    }
  }
}

function playMove(r, c) {
  if (gameOver) return;
  if (board[r][c] !== "") return;

  let letter = document.getElementById("letter").value;
  board[r][c] = letter;
  getCell(r,c).innerText = letter;

  let gained = checkSOS(r, c);

  if (gained > 0) {
    scores[currentPlayer] += gained;
  } else {
    currentPlayer = (currentPlayer + 1) % players.length;
  }

  updateScores();
  updateTurn();
  checkEnd();

  if (!gameOver && isComputer && players[currentPlayer] === "Computer") {
    setTimeout(computerMove, 600);
  }
}

function computerMove() {
  let empty = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (board[r][c] === "") empty.push([r,c]);

  if (empty.length === 0) return;

  let pick = empty[Math.floor(Math.random() * empty.length)];
  let r = pick[0];
  let c = pick[1];
  let letter = Math.random() < 0.5 ? "S" : "O";

  board[r][c] = letter;
  getCell(r,c).innerText = letter;

  let gained = checkSOS(r, c);

  if (gained > 0) {
    scores[currentPlayer] += gained;
  } else {
    currentPlayer = (currentPlayer + 1) % players.length;
  }

  updateScores();
  updateTurn();
  checkEnd();
}

function checkSOS(r, c) {
  let dirs = [[0,1],[1,0],[1,1],[1,-1]];
  let count = 0;
  let L = board[r][c];

  for (let i = 0; i < dirs.length; i++) {
    let dr = dirs[i][0];
    let dc = dirs[i][1];

    // Case 1: new letter is O
    if (L === "O") {
      let r1 = r - dr, c1 = c - dc;
      let r2 = r + dr, c2 = c + dc;
      if (inBounds(r1,c1) && inBounds(r2,c2)) {
        if (board[r1][c1] === "S" && board[r2][c2] === "S") {
          highlight(r1,c1,r,c,r2,c2);
          count++;
        }
      }
    }

    // Case 2: new letter is first S
    if (L === "S") {
      let r1 = r + dr, c1 = c + dc;
      let r2 = r + 2*dr, c2 = c + 2*dc;
      if (inBounds(r1,c1) && inBounds(r2,c2)) {
        if (board[r1][c1] === "O" && board[r2][c2] === "S") {
          highlight(r,c,r1,c1,r2,c2);
          count++;
        }
      }
    }

    // Case 3: new letter is last S
    if (L === "S") {
      let r1 = r - dr, c1 = c - dc;
      let r2 = r - 2*dr, c2 = c - 2*dc;
      if (inBounds(r1,c1) && inBounds(r2,c2)) {
        if (board[r1][c1] === "O" && board[r2][c2] === "S") {
          highlight(r2,c2,r1,c1,r,c);
          count++;
        }
      }
    }
  }
  return count;
}

function highlight(r1,c1,r,c,r2,c2) {
  getCell(r1,c1).classList.add("highlight");
  getCell(r,c).classList.add("highlight");
  getCell(r2,c2).classList.add("highlight");
}

function getCell(r,c) {
  return document.querySelector("[data-r='"+r+"'][data-c='"+c+"']");
}

function inBounds(r,c) {
  return r >= 0 && r < size && c >= 0 && c < size;
}

function updateScores() {
  let html = "";
  for (let i = 0; i < players.length; i++) {
    html += "<p>" + players[i] + ": " + scores[i] + "</p>";
  }
  document.getElementById("scores").innerHTML = html;
}

function updateTurn() {
  document.getElementById("turn").innerText =
    "Turn: " + players[currentPlayer];
}

function checkEnd() {
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (board[r][c] === "") return;

  gameOver = true;
  let max = Math.max.apply(null, scores);
  let winners = [];

  for (let i = 0; i < scores.length; i++) {
    if (scores[i] === max) winners.push(players[i]);
  }

  if (winners.length > 1)
    document.getElementById("winner").innerText = "Draw: " + winners.join(", ");
  else
    document.getElementById("winner").innerText = "Winner: " + winners[0];
}
