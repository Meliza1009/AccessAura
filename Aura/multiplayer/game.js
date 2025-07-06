// NeuroMaze Game - Neurodivergent-Friendly Multiplayer Game
class NeuroMaze {
    constructor() {
        this.currentScreen = 'mainMenu';
        this.gameState = {
            players: [],
            currentPlayerIndex: 0,
            level: 1,
            score: 0,
            audioEnabled: true,
            gamePaused: false
        };
        
        this.gameData = {
            player: { x: 400, y: 300, size: 20, color: '#667eea' },
            collectibles: [],
            obstacles: [],
            levelComplete: false,
            startTime: Date.now()
        };
        
        this.canvas = null;
        this.ctx = null;
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupAudio();
        this.updateUI();
    }
    
    setupEventListeners() {
        // Main menu events
        document.getElementById('multiplayerToggle').addEventListener('change', (e) => {
            const multiplayerSection = document.getElementById('multiplayerPlayers');
            multiplayerSection.classList.toggle('hidden', !e.target.checked);
        });
        
        document.getElementById('addPlayer').addEventListener('click', () => {
            const player3 = document.getElementById('player3');
            player3.classList.toggle('hidden');
        });
        
        document.getElementById('startGame').addEventListener('click', () => {
            this.startGame();
        });
        
        // Instructions screen events
        document.getElementById('backToMenu').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        document.getElementById('beginGame').addEventListener('click', () => {
            this.showScreen('gameScreen');
            this.startGameLoop();
        });
        
        // Game screen events
        document.getElementById('pauseGame').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('audioToggleGame').addEventListener('click', () => {
            this.toggleAudio();
        });
        
        document.getElementById('exitGame').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // Pause menu events
        document.getElementById('resumeGame').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restartGame').addEventListener('click', () => {
            this.restartLevel();
        });
        
        document.getElementById('quitGame').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // Level complete events
        document.getElementById('nextLevel').addEventListener('click', () => {
            this.nextLevel();
        });
        
        document.getElementById('playAgain').addEventListener('click', () => {
            this.restartLevel();
        });
        
        document.getElementById('backToMenuFromComplete').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // Audio toggle
        document.getElementById('audioToggle').addEventListener('change', (e) => {
            this.gameState.audioEnabled = e.target.checked;
            this.updateAudio();
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                e.preventDefault();
            }
            
            if (e.code === 'Escape' && this.currentScreen === 'gameScreen') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    setupAudio() {
        this.backgroundMusic = document.getElementById('backgroundMusic');
        this.successSound = document.getElementById('successSound');
        this.interactionSound = document.getElementById('interactionSound');
        
        // Create simple audio using Web Audio API
        this.createSimpleAudio();
    }
    
    createSimpleAudio() {
        // Create a simple beep sound for interactions
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        this.createBeep = (frequency = 440, duration = 0.1) => {
            if (!this.gameState.audioEnabled) return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    }
    
    startGame() {
        // Collect player data
        const players = [];
        
        // Player 1
        const username1 = document.getElementById('username').value || 'Player 1';
        const mode1 = document.getElementById('disabilityMode').value;
        players.push({ name: username1, mode: mode1 });
        
        // Check for multiplayer
        const isMultiplayer = document.getElementById('multiplayerToggle').checked;
        if (isMultiplayer) {
            const username2 = document.getElementById('username2').value || 'Player 2';
            const mode2 = document.getElementById('disabilityMode2').value;
            players.push({ name: username2, mode: mode2 });
            
            const player3 = document.getElementById('player3');
            if (!player3.classList.contains('hidden')) {
                const username3 = document.getElementById('username3').value || 'Player 3';
                const mode3 = document.getElementById('disabilityMode3').value;
                players.push({ name: username3, mode: mode3 });
            }
        }
        
        this.gameState.players = players;
        this.gameState.currentPlayerIndex = 0;
        this.gameState.level = 1;
        this.gameState.score = 0;
        
        // Apply accessibility modes
        this.applyAccessibilityModes();
        
        // Show instructions
        this.showInstructions();
    }
    
    applyAccessibilityModes() {
        const body = document.body;
        body.className = ''; // Reset classes
        
        // Apply modes for all players
        this.gameState.players.forEach(player => {
            if (player.mode !== 'none') {
                body.classList.add(`${player.mode}-mode`);
            }
        });
    }
    
    showInstructions() {
        const instructionsContent = document.getElementById('instructionsContent');
        const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
        
        let instructions = `
            <h3>Welcome, ${currentPlayer.name}! 🌟</h3>
            <p>You're about to embark on a magical adventure through the NeuroMaze!</p>
        `;
        
        // Add mode-specific instructions
        switch (currentPlayer.mode) {
            case 'dyslexia':
                instructions += `
                    <h4>📖 Dyslexia Support Active:</h4>
                    <ul>
                        <li>Text is displayed in a dyslexia-friendly font</li>
                        <li>Increased line spacing and letter spacing</li>
                        <li>No time pressure - take your time!</li>
                        <li>Clear, simple instructions</li>
                    </ul>
                `;
                break;
            case 'dyspraxia':
                instructions += `
                    <h4>🎯 Dyspraxia Support Active:</h4>
                    <ul>
                        <li>Larger buttons and controls</li>
                        <li>Slower, more forgiving movement</li>
                        <li>No fast reactions required</li>
                        <li>Clear visual feedback</li>
                    </ul>
                `;
                break;
            case 'adhd':
                instructions += `
                    <h4>⚡ ADHD Support Active:</h4>
                    <ul>
                        <li>Clear goals and objectives</li>
                        <li>Minimal distractions</li>
                        <li>Gentle reminders and feedback</li>
                        <li>Structured gameplay</li>
                    </ul>
                `;
                break;
            case 'autism':
                instructions += `
                    <h4>🧩 Autism Support Active:</h4>
                    <ul>
                        <li>Predictable patterns and routines</li>
                        <li>No sudden changes or surprises</li>
                        <li>Reduced animations and effects</li>
                        <li>Clear, consistent interface</li>
                    </ul>
                `;
                break;
            default:
                instructions += `
                    <h4>🎮 Standard Mode:</h4>
                    <ul>
                        <li>Classic gameplay experience</li>
                        <li>Balanced difficulty</li>
                        <li>Standard controls and feedback</li>
                    </ul>
                `;
        }
        
        instructions += `
            <h4>🎯 Your Mission:</h4>
            <p>Navigate through the magical maze and collect all the glowing orbs! 
            Use the arrow keys to move and spacebar to interact with special objects.</p>
        `;
        
        if (this.gameState.players.length > 1) {
            instructions += `
                <h4>👥 Multiplayer Mode:</h4>
                <p>You'll take turns with ${this.gameState.players.length - 1} other player(s). 
                Each player has their own accessibility settings!</p>
            `;
        }
        
        instructionsContent.innerHTML = instructions;
        this.showScreen('instructionsScreen');
    }
    
    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenName).classList.add('active');
        this.currentScreen = screenName;
        
        // Update UI
        this.updateUI();
    }
    
    updateUI() {
        if (this.currentScreen === 'gameScreen') {
            const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
            document.getElementById('playerName').textContent = currentPlayer.name;
            document.getElementById('levelNumber').textContent = this.gameState.level;
            document.getElementById('score').textContent = this.gameState.score;
            
            // Update audio button
            const audioBtn = document.getElementById('audioToggleGame');
            audioBtn.textContent = this.gameState.audioEnabled ? '🔊' : '🔇';
        }
    }
    
    startGameLoop() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize level
        this.initializeLevel();
        
        // Start game loop
        this.gameLoop();
    }
    
    initializeLevel() {
        const level = this.gameState.level;
        const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
        
        // Reset game data
        this.gameData.player.x = 400;
        this.gameData.player.y = 300;
        this.gameData.collectibles = [];
        this.gameData.obstacles = [];
        this.gameData.levelComplete = false;
        this.gameData.startTime = Date.now();
        
        // Create level based on player mode
        this.createLevel(level, currentPlayer.mode);
        
        // Update objective
        const objective = document.getElementById('objective');
        objective.textContent = `Collect all ${this.gameData.collectibles.length} orbs to complete the level!`;
        
        // Show game message
        this.showGameMessage(`Level ${level} - ${currentPlayer.name}'s turn!`);
    }
    
    createLevel(level, mode) {
        const numCollectibles = Math.min(3 + level, 8);
        const numObstacles = Math.min(level * 2, 10);
        
        // Create collectibles
        for (let i = 0; i < numCollectibles; i++) {
            this.gameData.collectibles.push({
                x: 100 + Math.random() * 600,
                y: 100 + Math.random() * 400,
                size: mode === 'dyspraxia' ? 30 : 20,
                collected: false,
                color: this.getRandomPastelColor()
            });
        }
        
        // Create obstacles (mode-dependent)
        for (let i = 0; i < numObstacles; i++) {
            const obstacle = {
                x: 50 + Math.random() * 700,
                y: 50 + Math.random() * 500,
                width: mode === 'dyspraxia' ? 80 : 60,
                height: mode === 'dyspraxia' ? 80 : 60,
                color: '#e2e8f0'
            };
            
            // Ensure obstacles don't block the player start position
            if (Math.abs(obstacle.x - 400) > 100 || Math.abs(obstacle.y - 300) > 100) {
                this.gameData.obstacles.push(obstacle);
            }
        }
    }
    
    getRandomPastelColor() {
        const colors = [
            '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA',
            '#FFB3D9', '#B3FFD9', '#D9B3FF', '#FFD9B3'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    gameLoop() {
        if (this.currentScreen !== 'gameScreen' || this.gameState.gamePaused) {
            requestAnimationFrame(() => this.gameLoop());
            return;
        }
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
        const speed = currentPlayer.mode === 'dyspraxia' ? 2 : 4;
        
        // Handle player movement
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.gameData.player.y -= speed;
        }
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.gameData.player.y += speed;
        }
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.gameData.player.x -= speed;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.gameData.player.x += speed;
        }
        
        // Keep player in bounds
        this.gameData.player.x = Math.max(10, Math.min(790, this.gameData.player.x));
        this.gameData.player.y = Math.max(10, Math.min(590, this.gameData.player.y));
        
        // Check collision with obstacles
        this.checkObstacleCollisions();
        
        // Check collision with collectibles
        this.checkCollectibleCollisions();
        
        // Check level completion
        this.checkLevelCompletion();
    }
    
    checkObstacleCollisions() {
        const player = this.gameData.player;
        
        for (const obstacle of this.gameData.obstacles) {
            if (player.x < obstacle.x + obstacle.width &&
                player.x + player.size > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.size > obstacle.y) {
                
                // Push player back
                if (player.x < obstacle.x) player.x = obstacle.x - player.size;
                if (player.x > obstacle.x) player.x = obstacle.x + obstacle.width;
                if (player.y < obstacle.y) player.y = obstacle.y - player.size;
                if (player.y > obstacle.y) player.y = obstacle.y + obstacle.height;
                
                this.createBeep(200, 0.1); // Low frequency for collision
            }
        }
    }
    
    checkCollectibleCollisions() {
        const player = this.gameData.player;
        
        for (const collectible of this.gameData.collectibles) {
            if (!collectible.collected) {
                const distance = Math.sqrt(
                    Math.pow(player.x + player.size/2 - collectible.x, 2) +
                    Math.pow(player.y + player.size/2 - collectible.y, 2)
                );
                
                if (distance < (player.size + collectible.size) / 2) {
                    collectible.collected = true;
                    this.gameState.score += 10;
                    this.createBeep(800, 0.2); // High frequency for success
                    this.showGameMessage('✨ Orb collected! +10 points');
                    this.updateUI();
                }
            }
        }
    }
    
    checkLevelCompletion() {
        const allCollected = this.gameData.collectibles.every(c => c.collected);
        
        if (allCollected && !this.gameData.levelComplete) {
            this.gameData.levelComplete = true;
            this.completeLevel();
        }
    }
    
    completeLevel() {
        const completionTime = Math.floor((Date.now() - this.gameData.startTime) / 1000);
        const timeBonus = Math.max(0, 60 - completionTime) * 5;
        this.gameState.score += timeBonus;
        
        this.createBeep(1000, 0.5); // Success sound
        
        // Check if there are more players
        if (this.gameState.currentPlayerIndex < this.gameState.players.length - 1) {
            // Next player's turn
            this.gameState.currentPlayerIndex++;
            this.showGameMessage(`Great job! ${this.gameState.players[this.gameState.currentPlayerIndex].name}'s turn next!`);
            setTimeout(() => {
                this.initializeLevel();
            }, 2000);
        } else {
            // All players completed, next level
            this.gameState.level++;
            this.gameState.currentPlayerIndex = 0;
            this.showLevelComplete(completionTime);
        }
    }
    
    showLevelComplete(completionTime) {
        document.getElementById('finalScore').textContent = this.gameState.score;
        document.getElementById('completionTime').textContent = this.formatTime(completionTime);
        this.showScreen('levelCompleteScreen');
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    showGameMessage(message) {
        const gameMessage = document.getElementById('gameMessage');
        gameMessage.textContent = message;
        gameMessage.style.display = 'block';
        
        setTimeout(() => {
            gameMessage.style.display = 'none';
        }, 3000);
    }
    
    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Clear canvas
        ctx.fillStyle = '#f7fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid background
        this.drawGrid();
        
        // Draw obstacles
        for (const obstacle of this.gameData.obstacles) {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.strokeStyle = '#cbd5e0';
            ctx.lineWidth = 2;
            ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
        
        // Draw collectibles
        for (const collectible of this.gameData.collectibles) {
            if (!collectible.collected) {
                ctx.fillStyle = collectible.color;
                ctx.beginPath();
                ctx.arc(collectible.x, collectible.y, collectible.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Add glow effect
                ctx.shadowColor = collectible.color;
                ctx.shadowBlur = 15;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
        
        // Draw player
        const player = this.gameData.player;
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x + player.size/2, player.y + player.size/2, player.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add player glow
        ctx.shadowColor = player.color;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Draw level info
        ctx.fillStyle = '#4a5568';
        ctx.font = '16px Lexend';
        ctx.textAlign = 'left';
        ctx.fillText(`Level ${this.gameState.level}`, 10, 25);
        ctx.fillText(`Score: ${this.gameState.score}`, 10, 45);
        
        // Draw collected count
        const collected = this.gameData.collectibles.filter(c => c.collected).length;
        const total = this.gameData.collectibles.length;
        ctx.fillText(`Orbs: ${collected}/${total}`, 10, 65);
    }
    
    drawGrid() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    togglePause() {
        this.gameState.gamePaused = !this.gameState.gamePaused;
        const pauseMenu = document.getElementById('pauseMenu');
        pauseMenu.classList.toggle('hidden', !this.gameState.gamePaused);
    }
    
    toggleAudio() {
        this.gameState.audioEnabled = !this.gameState.audioEnabled;
        this.updateUI();
        this.updateAudio();
    }
    
    updateAudio() {
        if (this.gameState.audioEnabled) {
            this.backgroundMusic.play().catch(() => {}); // Ignore autoplay restrictions
        } else {
            this.backgroundMusic.pause();
        }
    }
    
    restartLevel() {
        this.gameState.score = Math.max(0, this.gameState.score - 50); // Penalty for restart
        this.initializeLevel();
        this.togglePause();
        this.updateUI();
    }
    
    nextLevel() {
        this.showScreen('gameScreen');
        this.startGameLoop();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NeuroMaze();
}); 