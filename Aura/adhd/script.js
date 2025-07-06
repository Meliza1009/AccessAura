const playArea = document.getElementById("play-area");
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const startBtn = document.getElementById("start-btn");
const quizBox = document.getElementById("quiz");
const questionEl = document.getElementById("question");
const answerInput = document.getElementById("answer");
const submitBtn = document.getElementById("submit-answer");
const feedback = document.getElementById("feedback");
const endScreen = document.getElementById("end-screen");

let score = 0;
let level = 1;
let isRunning = false;
let gameInterval;
let spawnSpeed = 1500;

const distractions = ["📱", "🍕", "🐶", "🎈", "🎮"];
const focusSymbol = "🧘";

function spawnSymbol() {
  const symbol = document.createElement("div");
  symbol.classList.add("symbol");

  const isFocus = Math.random() < 0.3;
  symbol.textContent = isFocus ? focusSymbol : distractions[Math.floor(Math.random() * distractions.length)];

  const left = Math.random() * (playArea.clientWidth - 50);
  symbol.style.left = `${left}px`;

  playArea.appendChild(symbol);

  symbol.addEventListener("click", () => {
    if (symbol.textContent === focusSymbol) {
      score += 10;
    } else {
      score -= 5;
    }
    updateScore();
    symbol.remove();
  });

  setTimeout(() => {
    if (symbol.parentElement) symbol.remove();
  }, 5000);
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

function updateLevelDisplay() {
  levelDisplay.textContent = `Level: ${level}`;
}

function startGame() {
  if (isRunning) return;
  isRunning = true;
  score = 0;
  level = 1;
  spawnSpeed = 1500;
  updateScore();
  updateLevelDisplay();
  playLevel();
}

function playLevel() {
  clearInterval(gameInterval);
  gameInterval = setInterval(spawnSymbol, spawnSpeed);

  setTimeout(() => {
    clearInterval(gameInterval);
    askQuiz();
  }, 20000);
}

function askQuiz() {
  isRunning = false;
  quizBox.classList.remove("hidden");

  const { question, answer } = generateQuestion();
  quizBox.dataset.correct = answer;
  questionEl.textContent = question;
  answerInput.value = "";
  feedback.textContent = "";
}

function generateQuestion() {
  let num1 = Math.floor(Math.random() * 10) + 1;
  let num2 = Math.floor(Math.random() * 10) + 1;
  let op;

  if (level === 1) {
    op = Math.random() < 0.5 ? "+" : "-";
  } else if (level === 2) {
    op = Math.random() < 0.5 ? "*" : "/";
    if (op === "/") {
      num1 = num1 * num2;
    }
  } else {
    const ops = ["+", "-", "*", "/"];
    op = ops[Math.floor(Math.random() * ops.length)];
    if (op === "/") num1 = num1 * num2;
  }

  let expression = `${num1} ${op} ${num2}`;
  let answer = eval(expression);
  return { question: expression + " = ?", answer: answer.toFixed(0) };
}

submitBtn.addEventListener("click", () => {
  const userAnswer = answerInput.value.trim();
  const correct = quizBox.dataset.correct;

  if (userAnswer === correct) {
    feedback.textContent = "✅ Correct!";
    quizBox.classList.add("hidden");
    nextLevel();
  } else {
    feedback.textContent = "❌ Try again!";
  }
});

function nextLevel() {
  level++;
  if (level > 3) {
    endScreen.classList.remove("hidden");
    return;
  }

  // Increase difficulty
  spawnSpeed -= 300;
  updateLevelDisplay();
  isRunning = true;
  playLevel();
}

startBtn.addEventListener("click", startGame);
