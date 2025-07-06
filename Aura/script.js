const startBtn = document.getElementById("start-game");
const playerNameInput = document.getElementById("player-name");
const modeSelect = document.getElementById("mode-select");

startBtn.onclick = () => {
  const playerName = playerNameInput.value.trim();
  const mode = modeSelect.value;

  if (!playerName) {
    alert("Please enter your name!");
    return;
  }

  if (!mode) {
    alert("Please select a mode!");
    return;
  }

  // Send player name and mode to backend if needed
  // fetch("/api/login", {...})

  // Redirect to the correct game folder
  switch (mode) {
    case "adhd":
      window.location.href = "adhd/index.html";
      break;
    case "autism":
      window.location.href = "autism/index.html";
      break;
    case "dyslexia":
      window.location.href = "dyslexia/index.html";
      break;
    case "dyspraxia":
      window.location.href = "dyspraxia/index.html";
      break;
    case "multiplayer":
      window.location.href = "multiplayer/index.html";
      break;
    default:
      alert("Invalid mode selected!");
  }
};
