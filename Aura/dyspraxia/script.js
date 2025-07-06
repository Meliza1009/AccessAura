const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");

const gameArea = document.getElementById("game-area");
const feedback = document.getElementById("feedback");
const progress = document.getElementById("progress");
const hootSound = document.getElementById("hoot-sound");
const fireworksSound = document.getElementById("fireworks-sound");
const errorSound = document.getElementById("error-sound");
const bgm = document.getElementById("bgm");
const winOverlay = document.getElementById("win-overlay");
const winMessage = document.getElementById("win-message");
const levelComplete = document.getElementById("level-complete");
const nextStageBtn = document.getElementById("next-stage");
const winOwl = document.getElementById("win-owl");

const instruction = document.getElementById("instruction");

let currentLevel = 1;
let currentStage = 1;
let points = 0;
let owlsLeft = currentStage;
const stagesPerLevel = 10;

startBtn.onclick = () => {
  startScreen.style.display = "none";
  document.querySelector("h1").style.display = "block";
  instruction.style.display = "block";
  progress.style.display = "block";
  gameArea.style.display = "block";
  feedback.style.display = "block";

  bgm.volume = 0.3;
  bgm.play().catch(() => {});

  updateInstruction();
  updateProgress();
  createTargets(owlsLeft);
};

function getSafePosition() {
  const margin = 40; // keep away from edges
  const areaWidth = gameArea.clientWidth - 80 - margin;
  const areaHeight = gameArea.clientHeight - 80 - margin;
  const x = margin + Math.floor(Math.random() * areaWidth);
  const y = margin + Math.floor(Math.random() * areaHeight);
  return { x, y };
}

function updateInstruction() {
  if (currentLevel === 1) {
    instruction.textContent = "Tap the owls!";
  } else {
    instruction.textContent = "Tap the owls! Don’t tap the pigeons!";
  }
}

function updateProgress() {
  progress.textContent = `Level: ${currentLevel} | Stage: ${currentStage} | Owls Left: ${owlsLeft} | Points: ${points}`;
}

function createTargets(owlCount) {
  for (let i = 0; i < owlCount; i++) {
    const owl = document.createElement("div");
    owl.className = "owl";
    owl.textContent = "🦉";

    const { x, y } = getSafePosition();
    owl.style.left = `${x}px`;
    owl.style.top = `${y}px`;

    gameArea.appendChild(owl);
    setTimeout(() => owl.classList.add("show"), 50);

    owl.onclick = () => {
      hootSound.currentTime = 0;
      hootSound.play();

      owlsLeft--;
      updateProgress();
      feedback.textContent = `🦉 Good!`;

      owl.remove();

      if (owlsLeft === 0) {
        endStage();
      }
    };
  }

  if (currentLevel > 1) {
    const pigeonCount = Math.min(5, owlCount); // max 5 pigeons per stage
    for (let i = 0; i < pigeonCount; i++) {
      const pigeon = document.createElement("div");
      pigeon.className = "pigeon";
      pigeon.textContent = "🕊️";

      const { x, y } = getSafePosition();
      pigeon.style.left = `${x}px`;
      pigeon.style.top = `${y}px`;

      gameArea.appendChild(pigeon);
      setTimeout(() => pigeon.classList.add("show"), 50);

      pigeon.onclick = () => {
        errorSound.currentTime = 0;
        errorSound.play();
        feedback.textContent = `❌ Oops! That’s a pigeon!`;
      };
    }
  }
}

function endStage() {
  points += 10;
  if (currentStage === stagesPerLevel) {
    fireworksSound.currentTime = 0;
    fireworksSound.play();
    confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
    winOwl.classList.add("dance");
    winMessage.textContent = `🎆 Level ${currentLevel} Completed! +10 pts`;
    levelComplete.innerHTML = `✅`;
    nextStageBtn.textContent = `Start Level ${currentLevel + 1}`;
  } else {
    winMessage.textContent = `Stage ${currentStage} done! +10 pts!`;
    levelComplete.innerHTML = ``;
    nextStageBtn.textContent = "Next Stage";
  }
  updateProgress();
  winOverlay.style.display = "flex";
}

nextStageBtn.onclick = () => {
  if (currentStage === stagesPerLevel) {
    currentLevel++;
    currentStage = 1;
    winOwl.classList.remove("dance");
    levelComplete.innerHTML = ``;
    updateInstruction();
  } else {
    currentStage++;
  }
  owlsLeft = currentStage;
  updateProgress();
  feedback.textContent = "Spot the baby owls!";
  winOverlay.style.display = "none";
  createTargets(owlsLeft);
};
