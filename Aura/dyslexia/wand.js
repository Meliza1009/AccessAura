let words = [];
let currentWordIndex = 0;
let audioContext = null;
let audioEnabled = true;

// Initialize audio context for fallback sounds
function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.log('Audio context not supported');
  }
}

// Detect level from URL
const level = window.location.pathname.includes("level2") ? 2 :
              window.location.pathname.includes("level3") ? 3 : 1;

// Set word list based on level
if (level === 1) {
  words = [
    { syllables: ["pi", "zza"], emoji: "🍕" },
    { syllables: ["sun", "set"], emoji: "🌅" },
    { syllables: ["nap", "kin"], emoji: "🧻" }
  ];
} else if (level === 2) {
  words = [
    { syllables: ["an", "i", "mal"], emoji: "🦁" },
    { syllables: ["el", "e", "phant"], emoji: "🐘" },
    { syllables: ["beau", "ti", "ful"], emoji: "🌸" }
  ];
} else if (level === 3) {
  words = [
    { syllables: ["in", "vi", "si", "ble"], emoji: "🪄" },
    { syllables: ["in", "for", "ma", "tion"], emoji: "💡" },
    { syllables: ["im", "pos", "si", "ble"], emoji: "🚫" }
  ];
}

function initWord() {
  const word = words[currentWordIndex];
  const dropZone = document.getElementById('dropZone');
  const choices = document.getElementById('choices');
  const feedback = document.getElementById('feedback');
  const nextBtn = document.getElementById('nextBtn');

  dropZone.innerHTML = '';
  choices.innerHTML = '';
  feedback.innerText = '';
  nextBtn.style.display = 'none';

  // Add word display area if it doesn't exist
  let wordDisplay = document.getElementById('wordDisplay');
  if (!wordDisplay) {
    wordDisplay = document.createElement('div');
    wordDisplay.id = 'wordDisplay';
    wordDisplay.style.cssText = 'font-size: 2rem; font-weight: bold; margin: 20px 0; color: #2e7d32; min-height: 3rem;';
    dropZone.parentNode.insertBefore(wordDisplay, dropZone);
  }
  
  // Add audio controls if they don't exist
  let audioControls = document.getElementById('audioControls');
  if (!audioControls) {
    audioControls = document.createElement('div');
    audioControls.id = 'audioControls';
    audioControls.style.cssText = 'margin: 10px 0; padding: 10px; background: #f0f8ff; border-radius: 10px;';
    audioControls.innerHTML = `
      <button onclick="toggleAudio()" style="margin: 0 5px; padding: 5px 10px; font-size: 0.9rem;">
        ${audioEnabled ? '🔊 Audio ON' : '🔇 Audio OFF'}
      </button>
      <button onclick="speakCurrentWord()" style="margin: 0 5px; padding: 5px 10px; font-size: 0.9rem;">
        🔊 Hear Word
      </button>
      <button onclick="resetArrangement()" style="margin: 0 5px; padding: 5px 10px; font-size: 0.9rem;">
        🔄 Reset
      </button>
    `;
    dropZone.parentNode.insertBefore(audioControls, dropZone);
  }
  
  // Show target word and emoji
  wordDisplay.innerHTML = `<span style="font-size: 3rem; margin-right: 10px;">${word.emoji}</span><span style="color: #5b2c6f;">${word.syllables.join('')}</span>`;
  
  // Speak the target word
  setTimeout(() => {
    speakWord(word.syllables.join(''));
  }, 500);

  word.syllables.forEach(() => {
    const drop = document.createElement('div');
    drop.className = 'drop';
    drop.ondragover = (e) => e.preventDefault();
    drop.ondrop = dropHandler;
    dropZone.appendChild(drop);
  });

  const shuffled = [...word.syllables].sort(() => Math.random() - 0.5);
  shuffled.forEach(syllable => {
    const span = document.createElement('span');
    span.className = 'syllable';
    span.innerText = syllable;
    span.setAttribute('draggable', true);
    span.setAttribute('data-value', syllable);
    span.ondragstart = drag;
    span.onclick = () => speakSyllable(syllable); // Click to speak
    span.style.cursor = 'pointer'; // Show it's clickable
    choices.appendChild(span);
  });
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.dataset.value);
  ev.dataTransfer.setData("outerHTML", ev.target.outerHTML);
}

function dropHandler(ev) {
  ev.preventDefault();
  if (ev.target.firstChild) return;

  const outerHTML = ev.dataTransfer.getData("outerHTML");
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = outerHTML;
  const draggedElement = tempDiv.firstChild;

  draggedElement.ondragstart = drag;
  draggedElement.onclick = () => removeSyllable(draggedElement); // Click to remove
  ev.target.appendChild(draggedElement);
  
  // Speak the syllable that was just dropped
  const syllable = draggedElement.dataset.value;
  speakSyllable(syllable);
  
  // Speak the current arrangement
  speakCurrentArrangement();
}

function removeSyllable(element) {
  const choices = document.getElementById('choices');
  element.onclick = () => speakSyllable(element.dataset.value); // Reset click handler
  choices.appendChild(element);
  speakCurrentArrangement(); // Update display and speak current arrangement
}

function speakSyllable(syllable) {
  if (!audioEnabled) return;
  
  // Try Web Speech API first
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(syllable);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;
    speechSynthesis.speak(utterance);
  }
  
  // Fallback: Play a beep sound
  playBeep();
  
  // Visual feedback
  showSpellingFeedback(syllable);
}

function speakCurrentArrangement() {
  const dropZone = document.getElementById('dropZone');
  const drops = dropZone.querySelectorAll('.drop');
  const currentArrangement = Array.from(drops).map(d => d.firstChild?.dataset.value || '').filter(s => s);
  
  // Update visual word display
  const wordDisplay = document.getElementById('wordDisplay');
  if (wordDisplay) {
    if (currentArrangement.length > 0) {
      // Show current arrangement in a different style
      wordDisplay.innerHTML = `<span style="color: #2196f3; font-size: 2.5rem;">${currentArrangement.join('')}</span>`;
    } else {
      // Show target word again
      const word = words[currentWordIndex];
      wordDisplay.innerHTML = `<span style="font-size: 3rem; margin-right: 10px;">${word.emoji}</span><span style="color: #5b2c6f;">${word.syllables.join('')}</span>`;
    }
  }
  
  if (currentArrangement.length > 0 && audioEnabled) {
    // Speak the current arrangement with a slight delay
    setTimeout(() => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentArrangement.join(''));
        utterance.lang = 'en-US';
        utterance.rate = 0.7;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        speechSynthesis.speak(utterance);
      }
      playBeep();
      showSpellingFeedback(currentArrangement.join(''));
    }, 300);
  }
}

function showSpellingFeedback(text) {
  // Create or update spelling feedback display
  let spellingFeedback = document.getElementById('spellingFeedback');
  if (!spellingFeedback) {
    spellingFeedback = document.createElement('div');
    spellingFeedback.id = 'spellingFeedback';
    spellingFeedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(33, 150, 243, 0.9);
      color: white;
      padding: 20px 30px;
      border-radius: 15px;
      font-size: 2rem;
      font-weight: bold;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      animation: fadeInOut 1.5s ease-in-out;
    `;
    document.body.appendChild(spellingFeedback);
  }
  
  spellingFeedback.textContent = text;
  spellingFeedback.style.display = 'block';
  
  // Hide after animation
  setTimeout(() => {
    spellingFeedback.style.display = 'none';
  }, 1500);
}

function playBeep() {
  if (!audioContext) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    console.log('Audio playback failed:', e);
  }
}

function toggleAudio() {
  audioEnabled = !audioEnabled;
  const audioBtn = document.querySelector('#audioControls button');
  if (audioBtn) {
    audioBtn.textContent = audioEnabled ? '🔊 Audio ON' : '🔇 Audio OFF';
  }
}

function speakCurrentWord() {
  const word = words[currentWordIndex];
  speakWord(word.syllables.join(''));
}

function checkCurrentWord() {
  const word = words[currentWordIndex];
  const dropZone = document.getElementById('dropZone');
  const drops = dropZone.querySelectorAll('.drop');
  const userOrder = Array.from(drops).map(d => d.firstChild?.dataset.value || '').filter(s => s);
  const feedback = document.getElementById('feedback');

  if (JSON.stringify(userOrder) === JSON.stringify(word.syllables)) {
    feedback.innerText = "✅ Correct!";
    feedback.style.color = "green";
    speakWord(word.syllables.join(""));
    document.getElementById('nextBtn').style.display = 'inline-block';
  } else {
    feedback.innerText = "❌ Try again!";
    feedback.style.color = "red";
    
    // Clear the word display to show target word again
    const wordDisplay = document.getElementById('wordDisplay');
    if (wordDisplay) {
      wordDisplay.innerHTML = `<span style="font-size: 3rem; margin-right: 10px;">${word.emoji}</span><span style="color: #5b2c6f;">${word.syllables.join('')}</span>`;
    }

    // Return all syllables to choices area with animation
    const choices = document.getElementById('choices');
    drops.forEach((drop, index) => {
      if (drop.firstChild) {
        const syllable = drop.firstChild;
        
        // Reset click handler to speak syllable
        syllable.onclick = () => speakSyllable(syllable.dataset.value);
        
        // Add a small delay for visual effect
        setTimeout(() => {
          choices.appendChild(syllable);
          // Add a brief highlight effect
          syllable.style.transform = 'scale(1.1)';
          syllable.style.backgroundColor = '#ffeb3b';
          setTimeout(() => {
            syllable.style.transform = 'scale(1)';
            syllable.style.backgroundColor = '#d0f0fd';
          }, 300);
        }, index * 100); // Stagger the return animation
      }
    });
    
    // Speak the target word again to help the user
    setTimeout(() => {
      speakWord(word.syllables.join(''));
    }, 500);
  }
}

function nextWord() {
  currentWordIndex++;
  if (currentWordIndex < words.length) {
    initWord();
  } else {
    document.getElementById('dropZone').style.display = 'none';
    document.getElementById('choices').style.display = 'none';
    document.getElementById('instruction').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('feedback').style.display = 'none';
    document.getElementById('levelComplete').style.display = 'block';
  }
}

function speakWord(word) {
  if (!audioEnabled) return;
  
  // Stop any ongoing speech
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
  
  // Speak the complete word with celebration
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.6;
    utterance.pitch = 1.2;
    utterance.volume = 1.0;
    speechSynthesis.speak(utterance);
    
    // Add a second pronunciation after a short delay for reinforcement
    setTimeout(() => {
      const reinforcement = new SpeechSynthesisUtterance(word);
      reinforcement.lang = 'en-US';
      reinforcement.rate = 0.8;
      reinforcement.pitch = 1.0;
      speechSynthesis.speak(reinforcement);
    }, 1000);
  }
  
  // Visual feedback
  showSpellingFeedback(word);
  
  // Play celebration sound
  playBeep();
}

function resetArrangement() {
  const dropZone = document.getElementById('dropZone');
  const choices = document.getElementById('choices');
  const drops = dropZone.querySelectorAll('.drop');
  const word = words[currentWordIndex];

  // Clear the word display to show target word again
  const wordDisplay = document.getElementById('wordDisplay');
  if (wordDisplay) {
    wordDisplay.innerHTML = `<span style="font-size: 3rem; margin-right: 10px;">${word.emoji}</span><span style="color: #5b2c6f;">${word.syllables.join('')}</span>`;
  }

  // Return all syllables to choices area
  drops.forEach((drop, index) => {
    if (drop.firstChild) {
      const syllable = drop.firstChild;
      
      // Reset click handler to speak syllable
      syllable.onclick = () => speakSyllable(syllable.dataset.value);
      
      // Add a small delay for visual effect
      setTimeout(() => {
        choices.appendChild(syllable);
        // Add a brief highlight effect
        syllable.style.transform = 'scale(1.1)';
        syllable.style.backgroundColor = '#ffeb3b';
        setTimeout(() => {
          syllable.style.transform = 'scale(1)';
          syllable.style.backgroundColor = '#d0f0fd';
        }, 300);
      }, index * 100); // Stagger the return animation
    }
  });
  
  // Speak the target word again
  setTimeout(() => {
    speakWord(word.syllables.join(''));
  }, 500);
}

window.onload = function() {
  initAudio();
  initWord();
};
