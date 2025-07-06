const scenarios = [
  {
    image: "https://i.imgur.com/1YcFifP.png",
    text: "Your ocean friend is crying. What will you do?",
    options: [
      { label: "🤗 Hug", key: "hug", correct: true },
      { label: "😂 Laugh", key: "laugh", correct: false },
      { label: "🚶 Walk away", key: "walk", correct: false }
    ],
    feedback: {
      hug: "Great job! You gave a hug and your friend feels better 🥰",
      laugh: "Oh no! Laughing can make them feel worse 💡",
      walk: "Walking away might make them feel lonely 💙"
    }
  },
  {
    image: "https://i.imgur.com/4VYwW6G.png",
    text: "Your friend is scared. What will you do?",
    options: [
      { label: "🛡 Stay with them", key: "stay", correct: true },
      { label: "👻 Scare them more", key: "scare", correct: false },
      { label: "🤷 Ignore", key: "ignore", correct: false }
    ],
    feedback: {
      stay: "Perfect! Staying makes them feel safe 🛡",
      scare: "Not the time for pranks. Try to help 💡",
      ignore: "Ignoring won't help. Let's support them 💙"
    }
  },
  {
    image: "https://i.imgur.com/fDWi9JW.png",
    text: "Your friend dropped their toy and looks upset. What will you do?",
    options: [
      { label: "🔍 Help pick it", key: "pick", correct: true },
      { label: "😅 Laugh at them", key: "laugh", correct: false },
      { label: "😐 Do nothing", key: "nothing", correct: false }
    ],
    feedback: {
      pick: "Awesome! Helping others is kind ❤",
      laugh: "Laughing might hurt their feelings 💡",
      nothing: "Try doing something helpful 💙"
    }
  },
  {
    image: "https://i.imgur.com/Yc4DbUl.png",
    text: "You feel sad today. What can you do?",
    options: [
      { label: "🌈 Hug yourself", key: "hugself", correct: true },
      { label: "🙃 Pretend", key: "pretend", correct: false },
      { label: "😶 Ignore it", key: "ignore", correct: false }
    ],
    feedback: {
      hugself: "Great! Being kind to yourself is powerful 🌈",
      pretend: "It's okay to be real with feelings 💡",
      ignore: "Ignoring doesn't help. Try being kind 💙"
    }
  },
  // Add 16 more in same structure...
];

let currentScenario = 0;

// Buddy Fish stats
let buddyStats = {
  kindness: 0,
  calmness: 0,
  helpfulness: 0
};

// Update Buddy Fish appearance based on stats
function updateBuddyFish() {
  const fish = document.getElementById("buddyFish");
  // Simple logic: change image or add effects as stats increase
  let src = "https://i.imgur.com/1YcFifP.png"; // base fish
  let filter = "none";
  let sparkle = false;
  let sing = false;

  if (buddyStats.kindness >= 2) {
    src = "https://i.imgur.com/4VYwW6G.png"; // new fin
  }
  if (buddyStats.calmness >= 2) {
    filter = "drop-shadow(0 0 10px #00e1ff)";
  }
  if (buddyStats.helpfulness >= 2) {
    sparkle = true;
  }
  if (buddyStats.kindness >= 3 && buddyStats.calmness >= 3 && buddyStats.helpfulness >= 3) {
    sing = true;
  }

  fish.src = src;
  fish.style.filter = filter;
  fish.classList.toggle("sparkle", sparkle);
  fish.classList.toggle("sing", sing);
}

// Map scenario index to emoji for story mode
const storyEmojis = [
  '😭', // crying friend
  '😨', // scared friend
  '😢', // upset friend
  '😔', // sad self
  // Add more as needed for more scenarios
];

function showScenario() {
  const scenario = scenarios[currentScenario];
  // Remove buddy fish image for emoji-only mode
  const storyBox = document.getElementById('storyBox');
  const buddyFish = document.getElementById('buddyFish');
  if (buddyFish) buddyFish.style.display = 'none';
  // Show main buddy emoji at top
  let buddyEmoji = document.getElementById('buddyMainEmoji');
  if (!buddyEmoji) {
    buddyEmoji = document.createElement('span');
    buddyEmoji.id = 'buddyMainEmoji';
    buddyEmoji.style.fontSize = '3.5rem';
    buddyEmoji.style.display = 'block';
    buddyEmoji.style.margin = '0 auto 10px auto';
    storyBox.insertBefore(buddyEmoji, storyBox.firstChild);
  }
  buddyEmoji.textContent = '🐠'; // Always show fish as main buddy
  // Show scenario emoji below
  const emojiSpan = document.getElementById('storyEmoji');
  emojiSpan.textContent = storyEmojis[currentScenario % storyEmojis.length] || '🐠';
  document.getElementById("storyText").textContent = scenario.text;
  document.getElementById("feedbackText").textContent = "";
  document.getElementById("nextBtn").style.display = "none";

  const choicesBox = document.getElementById("choicesBox");
  choicesBox.innerHTML = "";
  scenario.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option.label;
    btn.onclick = () => chooseAnswer(option.key);
    choicesBox.appendChild(btn);
  });
}

function chooseAnswer(choice) {
  const scenario = scenarios[currentScenario];
  const feedback = document.getElementById("feedbackText");
  const nextBtn = document.getElementById("nextBtn");
  const isCorrect = scenario.options.find(o => o.key === choice)?.correct;

  feedback.textContent = scenario.feedback[choice];
  feedback.style.color = isCorrect ? "#00c853" : "#d32f2f";

  if (isCorrect) {
    // Update stats based on scenario (for demo, rotate which stat increases)
    if (currentScenario % 3 === 0) buddyStats.kindness++;
    if (currentScenario % 3 === 1) buddyStats.calmness++;
    if (currentScenario % 3 === 2) buddyStats.helpfulness++;
    updateBuddyFish();
    updateStatTracker();
    nextBtn.style.display = "inline-block";
  }
}

function nextScenario() {
  currentScenario++;
  if (currentScenario >= scenarios.length) {
    document.getElementById("storyBox").innerHTML = `
      <h2>🌊 You helped so many friends. You're awesome! 💙</h2>
      <button onclick="restartGame()">🔁 Play Again</button>
    `;
    return;
  }
  showScenario();
}

function restartGame() {
  currentScenario = 0;
  showScenario();
}

// Mode selection logic
function selectMode(mode) {
  document.getElementById('menuOceanBg').style.display = 'none';
  document.getElementById('storyMode').style.display = 'none';
  document.getElementById('sandboxMode').style.display = 'none';
  document.getElementById('colorMode').style.display = 'none';
  if (mode === 'story') {
    document.getElementById('storyMode').style.display = 'flex';
    startStoryMode();
  } else if (mode === 'sandbox') {
    document.getElementById('sandboxMode').style.display = 'flex';
    startSandboxMode();
  } else if (mode === 'color') {
    document.getElementById('colorMode').style.display = 'flex';
    startColorMode();
  }
}

function backToMenu() {
  document.getElementById('menuOceanBg').style.display = 'block';
  document.getElementById('modeSelect').style.display = 'block';
  document.getElementById('storyMode').style.display = 'none';
  document.getElementById('sandboxMode').style.display = 'none';
  document.getElementById('colorMode').style.display = 'none';
  // Pause/stop any mode-specific music or timers here if needed
  // Reset music to default
  const audio = document.getElementById('mainAudio');
  audio.querySelector('source').src = 'https://cdn.pixabay.com/audio/2022/03/11/audio_66543b8f3a.mp3';
  audio.load();
  audio.play();
}

// Story Mode logic
function startStoryMode() {
  currentScenario = 0;
  buddyStats = { kindness: 0, calmness: 0, helpfulness: 0 };
  showScenario();
  updateBuddyFish();
  updateStatTracker();
}

function updateStatTracker() {
  const statDiv = document.getElementById('statTracker');
  statDiv.innerHTML = `
    <div style="font-size:16px; margin-bottom:8px;">
      Kindness: <span style="color:#ffb347;">${buddyStats.kindness}</span> |
      Calmness: <span style="color:#00e1ff;">${buddyStats.calmness}</span> |
      Helpfulness: <span style="color:#7ed957;">${buddyStats.helpfulness}</span>
    </div>
  `;
}

// Sandbox Mode: Add sea creatures as emojis
const seaCreatures = [
  { name: 'Fish', emoji: '🐟' },
  { name: 'Dolphin', emoji: '🐬' },
  { name: 'Starfish', emoji: '⭐' },
  { name: 'Crab', emoji: '🦀' },
  { name: 'Octopus', emoji: '🐙' },
  { name: 'Coral', emoji: '🪸' },
  { name: 'Shell', emoji: '🐚' },
  { name: 'Whale', emoji: '🐋' },
  { name: 'Turtle', emoji: '🐢' },
  { name: 'Jellyfish', emoji: '🪼' },
  { name: 'Squid', emoji: '🦑' },
  { name: 'Lobster', emoji: '🦞' },
  { name: 'Shrimp', emoji: '🦐' },
  { name: 'Shark', emoji: '🦈' }
];

function startSandboxMode() {
  // Clear ocean
  const ocean = document.getElementById('sandboxOcean');
  ocean.innerHTML = '';
  // Add drag-and-drop creatures as emojis
  const palette = document.getElementById('creaturePalette');
  palette.innerHTML = '';
  seaCreatures.forEach(creature => {
    const span = document.createElement('span');
    span.textContent = creature.emoji;
    span.title = creature.name;
    span.className = 'creature-icon';
    span.draggable = true;
    span.style.fontSize = '1.6rem'; // palette smaller
    span.ondragstart = e => {
      e.dataTransfer.setData('text/plain', creature.emoji);
    };
    palette.appendChild(span);
  });
  // Ocean drop logic
  ocean.ondragover = e => e.preventDefault();
  ocean.ondrop = e => {
    e.preventDefault();
    const emoji = e.dataTransfer.getData('text/plain');
    if (emoji) {
      const newSpan = document.createElement('span');
      newSpan.textContent = emoji;
      newSpan.className = 'creature-icon';
      newSpan.style.position = 'absolute';
      newSpan.style.fontSize = '2.5rem'; // ocean larger
      // Place at drop position relative to ocean, but keep inside bounds
      const rect = ocean.getBoundingClientRect();
      let left = e.clientX - rect.left - 32;
      let top = e.clientY - rect.top - 32;
      // Clamp to box
      left = Math.max(0, Math.min(left, rect.width - 48));
      top = Math.max(0, Math.min(top, rect.height - 48));
      newSpan.style.left = left + 'px';
      newSpan.style.top = top + 'px';
      // Add bounce animation
      newSpan.animate([
        { transform: 'scale(1.5)' },
        { transform: 'scale(1)' }
      ], { duration: 300, easing: 'ease' });
      ocean.appendChild(newSpan);
    }
  };
  // Music/task placeholders
  document.getElementById('musicPicker').innerHTML = '<em>Music picker coming soon!</em>';
  document.getElementById('taskDesigner').innerHTML = '<em>Task designer coming soon!</em>';
}

// Color Therapy Mode: Add color zone selector
const colorZones = [
  { name: 'Blue Zone', color: '#7ecbff', music: 'https://cdn.pixabay.com/audio/2022/03/11/audio_66543b8f3a.mp3', desc: 'Calming, fewer fish' },
  { name: 'Yellow Zone', color: '#fff7b2', music: 'https://cdn.pixabay.com/audio/2022/10/16/audio_12b1b1e7e2.mp3', desc: 'Energetic, playful music' },
  { name: 'Purple Zone', color: '#e0b3ff', music: 'https://cdn.pixabay.com/audio/2022/10/16/audio_12b1b1e7e2.mp3', desc: 'Dreamy and soft' }
];
let currentZone = 0;

function startColorMode() {
  const controls = document.getElementById('colorZoneControls');
  controls.innerHTML = '';
  colorZones.forEach((zone, i) => {
    const btn = document.createElement('button');
    btn.textContent = zone.name;
    btn.className = 'color-btn' + (i === 0 ? ' selected' : '');
    btn.onclick = () => selectColorZone(i);
    controls.appendChild(btn);
  });
  selectColorZone(0);
}

function selectColorZone(i) {
  currentZone = i;
  // Change ocean background
  const ocean = document.getElementById('colorZoneOcean');
  ocean.style.background = colorZones[i].color;
  ocean.innerHTML = `<span style='font-size:22px;'>${colorZones[i].desc}</span>`;
  // Highlight selected button
  const btns = document.querySelectorAll('#colorZoneControls .color-btn');
  btns.forEach((btn, idx) => btn.classList.toggle('selected', idx === i));
  // Change music
  const audio = document.getElementById('mainAudio');
  audio.querySelector('source').src = colorZones[i].music;
  audio.load();
  audio.play();
}

window.onload = function() {
  document.getElementById('menuOceanBg').style.display = 'block';
  document.getElementById('modeSelect').style.display = 'block';
  document.getElementById('storyMode').style.display = 'none';
  document.getElementById('sandboxMode').style.display = 'none';
  document.getElementById('colorMode').style.display = 'none';
};