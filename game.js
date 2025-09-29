// Autumn Burst - Fall Match-4 Puzzle Game
class AutumnBurstGame {
    constructor() {
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 8;
        this.cellSize = 60;
        this.grid = [];
        this.score = 0;
        this.combo = 0;
        this.gameRunning = true;
        this.animating = false;
        this.selectedCell = null;
        this.burstingCells = [];
        
        // Game state and progression
        this.gameState = {
            level: 1,
            xp: 0,
            highScore: 0,
            totalGamesPlayed: 0,
            achievements: [],
            unlockedThemes: ['autumn'],
            currentTheme: 'autumn',
            gameMode: 'classic',
            powerUps: {
                goldenLeaf: 3,
                harvestMoon: 2,
                autumnWind: 2,
                frostTouch: 1,
                cornucopia: 1
            },
            settings: {
                soundEnabled: true,
                particlesEnabled: true,
                hapticEnabled: true,
                darkMode: false,
                colorblindMode: false,
                reducedMotion: false,
                difficulty: 'normal'
            }
        };
        
        // Theme configurations
        this.themes = {
            autumn: {
                name: 'Autumn Classic',
                icons: ['🍂', '🎃', '🌰', '🍎', '🍄', '🌻', '🥧', '📚'],
                colors: {
                    '🍂': '#D2691E', '🎃': '#FF6347', '🌰': '#8B4513', '🍎': '#DC143C',
                    '🍄': '#CD853F', '🌻': '#FFD700', '🥧': '#DEB887', '📚': '#4682B4'
                }
            },
            halloween: {
                name: 'Halloween Spooky',
                icons: ['🎃', '👻', '🦇', '🕷️', '🕸️', '🌙', '⚡', '🔮'],
                colors: {
                    '🎃': '#FF6347', '👻': '#F0F8FF', '🦇': '#2F1B14', '🕷️': '#8B0000',
                    '🕸️': '#C0C0C0', '🌙': '#FFD700', '⚡': '#9370DB', '🔮': '#4B0082'
                }
            },
            thanksgiving: {
                name: 'Thanksgiving Feast',
                icons: ['🦃', '🥧', '🌽', '🍠', '🥜', '🍯', '🍞', '🧈'],
                colors: {
                    '🦃': '#8B4513', '🥧': '#DEB887', '🌽': '#FFD700', '🍠': '#FF8C00',
                    '🥜': '#DDD1A0', '🍯': '#FFA500', '🍞': '#DEB887', '🧈': '#FFFFE0'
                }
            },
            harvest: {
                name: 'Harvest Time',
                icons: ['🌾', '🌽', '🍇', '🍊', '🥕', '🌶️', '🥔', '🧅'],
                colors: {
                    '🌾': '#DAA520', '🌽': '#FFD700', '🍇': '#8A2BE2', '🍊': '#FFA500',
                    '🥕': '#FF6347', '🌶️': '#DC143C', '🥔': '#D2B48C', '🧅': '#F5DEB3'
                }
            }
        };
        
        // Current theme icons and colors
        this.icons = this.themes[this.gameState.currentTheme].icons;
        this.iconColors = this.themes[this.gameState.currentTheme].colors;
        
        // Game modes configuration
        this.gameModes = {
            classic: { name: 'Classic', timeLimit: null, objectives: null },
            timeattack: { name: 'Time Attack', timeLimit: 60, objectives: null },
            zen: { name: 'Zen Mode', timeLimit: null, objectives: null, noPressure: true },
            challenge: { name: 'Challenge', timeLimit: null, objectives: [] },
            puzzle: { name: 'Puzzle', timeLimit: null, objectives: [], predefinedBoard: true }
        };
        
        // Load saved game state
        this.loadGameState();
        
        this.init();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    init() {
        // Initialize empty grid
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
        this.fillGridWithoutMatches();
        this.updateDisplay();
    }
    
    fillGridWithoutMatches() {
        // Fill grid while avoiding initial matches
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (!this.grid[row][col]) {
                    let attempts = 0;
                    let icon;
                    do {
                        icon = this.getRandomIcon();
                        attempts++;
                    } while (this.wouldCreateMatch(row, col, icon) && attempts < 10);
                    
                    this.grid[row][col] = icon;
                }
            }
        }
    }
    
    wouldCreateMatch(row, col, icon) {
        // Temporarily place the icon and check for matches
        const original = this.grid[row][col];
        this.grid[row][col] = icon;
        
        const cluster = this.findCluster(row, col, icon, 
            Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(false)));
        
        this.grid[row][col] = original;
        return cluster.length >= 4;
    }
    
    fillGrid() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (!this.grid[row][col]) {
                    this.grid[row][col] = this.getRandomIcon();
                }
            }
        }
    }
    
    getRandomIcon() {
        return this.icons[Math.floor(Math.random() * this.icons.length)];
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('newGameBtn').addEventListener('click', () => this.restart());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        
        // Power-up buttons
        document.getElementById('goldenLeafBtn').addEventListener('click', () => this.usePowerUp('goldenLeaf'));
        document.getElementById('harvestMoonBtn').addEventListener('click', () => this.usePowerUp('harvestMoon'));
        document.getElementById('autumnWindBtn').addEventListener('click', () => this.usePowerUp('autumnWind'));
        document.getElementById('frostTouchBtn').addEventListener('click', () => this.usePowerUp('frostTouch'));
        document.getElementById('cornucopiaBtn').addEventListener('click', () => this.usePowerUp('cornucopia'));
        
        // Theme selector
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.switchTheme(e.target.value);
        });
        
        // Settings button (placeholder for future settings panel)
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showAchievement('Settings panel coming soon! ⚙️');
        });
    }
    
    handleClick(e) {
        if (!this.gameRunning || this.animating) {
            console.log('Click blocked - game not running or animating');
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        console.log('Click detected at:', {row, col, x, y});
        
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            if (!this.selectedCell) {
                // First click - select a cell
                this.selectedCell = {row, col};
                console.log('Selected cell:', this.selectedCell);
            } else {
                // Second click - try to swap with selected cell
                if (this.isAdjacent(this.selectedCell, {row, col})) {
                    console.log('Attempting swap between:', this.selectedCell, 'and', {row, col});
                    this.swapCells(this.selectedCell, {row, col});
                    this.selectedCell = null;
                } else {
                    // Click on non-adjacent cell - select new cell
                    console.log('Non-adjacent click, selecting new cell:', {row, col});
                    this.selectedCell = {row, col};
                }
            }
        }
    }
    
    isAdjacent(cell1, cell2) {
        const rowDiff = Math.abs(cell1.row - cell2.row);
        const colDiff = Math.abs(cell1.col - cell2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    async swapCells(cell1, cell2) {
        this.animating = true;
        
        // Swap the icons
        const temp = this.grid[cell1.row][cell1.col];
        this.grid[cell1.row][cell1.col] = this.grid[cell2.row][cell2.col];
        this.grid[cell2.row][cell2.col] = temp;
        
        // Always allow the swap first, then check for matches
        await this.delay(100);
        
        // Check if this swap creates matches
        const matches = this.findMatches();
        if (matches.length > 0) {
            // Valid swap - process matches
            await this.checkAndProcessMatches();
        } else {
            // Invalid swap - swap back after a brief pause
            await this.delay(300);
            this.grid[cell2.row][cell2.col] = this.grid[cell1.row][cell1.col];
            this.grid[cell1.row][cell1.col] = temp;
            this.animating = false;
        }
    }
    
    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background pattern
        this.ctx.fillStyle = '#F4E4BC';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
        
        // Draw icons
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    const x = col * this.cellSize + this.cellSize / 2;
                    const y = row * this.cellSize + this.cellSize / 2;
                    
                    // Highlight selected cell
                    if (this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col) {
                        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
                        this.ctx.fillRect(col * this.cellSize + 2, row * this.cellSize + 2, 
                                        this.cellSize - 4, this.cellSize - 4);
                    } else {
                        // Draw normal icon background
                        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        this.ctx.fillRect(col * this.cellSize + 2, row * this.cellSize + 2, 
                                        this.cellSize - 4, this.cellSize - 4);
                    }
                    
                    // Draw icon
                    this.ctx.fillText(this.grid[row][col], x, y);
                }
            }
        }
        
        // Draw bursting effects
        this.drawBurstEffects();
    }
    
    drawBurstEffects() {
        const currentTime = Date.now();
        
        this.burstingCells = this.burstingCells.filter(burstCell => {
            const elapsed = currentTime - burstCell.startTime;
            const duration = 800; // Animation duration in ms
            
            if (elapsed > duration) return false;
            
            const progress = elapsed / duration;
            const x = burstCell.x;
            const y = burstCell.y;
            
            // Draw multiple scattered particles
            for (let i = 0; i < burstCell.particles.length; i++) {
                const particle = burstCell.particles[i];
                const particleX = x + particle.vx * progress * 60;
                const particleY = y + particle.vy * progress * 60;
                const alpha = 1 - progress;
                const scale = 1 - progress * 0.8;
                
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.translate(particleX, particleY);
                this.ctx.scale(scale, scale);
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(burstCell.icon, 0, 0);
                this.ctx.restore();
            }
            
            return true;
        });
    }
    
    findMatches() {
        const matches = [];
        const visited = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(false));
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (!visited[row][col] && this.grid[row][col]) {
                    const cluster = this.findCluster(row, col, this.grid[row][col], visited);
                    if (cluster.length >= 4) {
                        matches.push(cluster);
                    }
                }
            }
        }
        
        return matches;
    }
    
    findCluster(startRow, startCol, icon, visited) {
        const cluster = [];
        const stack = [{row: startRow, col: startCol}];
        
        while (stack.length > 0) {
            const {row, col} = stack.pop();
            
            if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize ||
                visited[row][col] || this.grid[row][col] !== icon) {
                continue;
            }
            
            visited[row][col] = true;
            cluster.push({row, col});
            
            // Add adjacent cells
            stack.push({row: row - 1, col});
            stack.push({row: row + 1, col});
            stack.push({row, col: col - 1});
            stack.push({row, col: col + 1});
        }
        
        return cluster;
    }
    
    async checkAndProcessMatches() {
        const matches = this.findMatches();
        
        if (matches.length > 0) {
            this.animating = true;
            await this.burstMatches(matches);
            this.applyGravity();
            this.fillGrid();
            this.combo++;
            await this.delay(300);
            this.animating = false;
            
            // Check for chain reactions
            setTimeout(() => this.checkAndProcessMatches(), 100);
        } else {
            this.combo = 0;
            this.checkGameOver();
        }
    }
    
    async burstMatches(matches) {
        let totalPoints = 0;
        
        for (const cluster of matches) {
            const basePoints = cluster.length * 10;
            const comboMultiplier = this.combo + 1;
            const sizeBonus = cluster.length > 6 ? cluster.length * 5 : 0;
            const points = (basePoints + sizeBonus) * comboMultiplier;
            totalPoints += points;
            
            // Create burst effects for each matched icon
            for (const {row, col} of cluster) {
                this.createBurstEffect(row, col, this.grid[row][col]);
                this.grid[row][col] = null;
            }
        }
        
        this.score += totalPoints;
        this.addXP(Math.floor(totalPoints / 5)); // Award XP
        this.updateDisplay();
        
        // Check for large combo achievements
        if (this.combo >= 5) {
            this.showAchievement(`🔥 ${this.combo}x Combo!`);
        }
        
        // Show points animation and wait for burst effect
        await this.delay(400);
    }
    
    createBurstEffect(row, col, icon) {
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;
        
        // Create multiple particles for scattering effect
        const particles = [];
        const particleCount = 6;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 2 + Math.random() * 2;
            particles.push({
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed
            });
        }
        
        this.burstingCells.push({
            x: x,
            y: y,
            icon: icon,
            particles: particles,
            startTime: Date.now()
        });
    }
    
    applyGravity() {
        for (let col = 0; col < this.gridSize; col++) {
            // Collect non-null icons in this column
            const icons = [];
            for (let row = this.gridSize - 1; row >= 0; row--) {
                if (this.grid[row][col]) {
                    icons.push(this.grid[row][col]);
                    this.grid[row][col] = null;
                }
            }
            
            // Place icons at bottom
            for (let i = 0; i < icons.length; i++) {
                this.grid[this.gridSize - 1 - i][col] = icons[i];
            }
        }
    }
    
    updateDisplay() {
        // Update score and combo
        document.getElementById('score').textContent = this.score;
        document.getElementById('combo').textContent = this.combo + 'x';
        document.getElementById('level').textContent = this.gameState.level;
        document.getElementById('highScore').textContent = this.gameState.highScore;
        
        // Update power-up counts
        document.getElementById('goldenLeafCount').textContent = this.gameState.powerUps.goldenLeaf;
        document.getElementById('harvestMoonCount').textContent = this.gameState.powerUps.harvestMoon;
        document.getElementById('autumnWindCount').textContent = this.gameState.powerUps.autumnWind;
        document.getElementById('frostTouchCount').textContent = this.gameState.powerUps.frostTouch;
        document.getElementById('cornucopiaCount').textContent = this.gameState.powerUps.cornucopia;
        
        // Enable/disable power-up buttons
        document.getElementById('goldenLeafBtn').disabled = this.gameState.powerUps.goldenLeaf <= 0;
        document.getElementById('harvestMoonBtn').disabled = this.gameState.powerUps.harvestMoon <= 0;
        document.getElementById('autumnWindBtn').disabled = this.gameState.powerUps.autumnWind <= 0;
        document.getElementById('frostTouchBtn').disabled = this.gameState.powerUps.frostTouch <= 0;
        document.getElementById('cornucopiaBtn').disabled = this.gameState.powerUps.cornucopia <= 0;
        
        // Update player stats
        document.getElementById('playerXP').textContent = this.gameState.xp;
        document.getElementById('nextLevelXP').textContent = this.gameState.level * 1000;
        document.getElementById('gamesPlayed').textContent = this.gameState.totalGamesPlayed;
        document.getElementById('achievementCount').textContent = this.gameState.achievements.length;
        
        // Update XP progress bar
        const currentLevelXP = (this.gameState.level - 1) * 1000;
        const nextLevelXP = this.gameState.level * 1000;
        const progressPercent = ((this.gameState.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
        document.getElementById('xpProgress').style.width = Math.min(100, Math.max(0, progressPercent)) + '%';
        
        // Update theme selector
        const themeSelect = document.getElementById('themeSelect');
        themeSelect.value = this.gameState.currentTheme;
        
        // Enable unlocked themes
        const options = themeSelect.options;
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            option.disabled = !this.gameState.unlockedThemes.includes(option.value);
        }
        
        // Update next icons preview
        const nextIconsContainer = document.getElementById('nextIcons');
        nextIconsContainer.innerHTML = '';
        
        for (let i = 0; i < 3; i++) {
            const iconElement = document.createElement('div');
            iconElement.className = 'next-icon';
            iconElement.textContent = this.getRandomIcon();
            nextIconsContainer.appendChild(iconElement);
        }
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.drawGrid();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    restart() {
        // Update game statistics
        this.gameState.totalGamesPlayed++;
        if (this.score > this.gameState.highScore) {
            this.gameState.highScore = this.score;
            this.showAchievement('🏆 New High Score!');
        }
        
        // Award XP based on performance
        const xpGained = Math.floor(this.score / 10);
        this.addXP(xpGained);
        
        // Check achievements before reset
        this.checkAchievements();
        
        // Reset game state
        this.score = 0;
        this.combo = 0;
        this.gameRunning = true;
        this.animating = false;
        this.selectedCell = null;
        this.burstingCells = [];
        document.getElementById('gameOverlay').style.display = 'none';
        this.init();
    }
    
    togglePause() {
        this.gameRunning = !this.gameRunning;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.gameRunning ? 'Pause' : 'Resume';
        
        if (this.gameRunning) {
            this.gameLoop();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverlay').style.display = 'flex';
    }
    
    checkGameOver() {
        // Check achievements first
        this.checkAchievements();
        
        // Simple game over condition: if score reaches a milestone, show celebration
        // Or if no moves possible (in a more complex version)
        if (this.score >= 1000) {
            this.showAchievement("Autumn Master! 🍂");
        }
        
        // Check for impossible moves (future enhancement)
        // For now, game continues indefinitely
    }
    
    showAchievement(message) {
        // Create a temporary achievement display
        const achievement = document.createElement('div');
        achievement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #DAA520, #D2691E);
            color: white;
            padding: 20px;
            border-radius: 15px;
            font-size: 1.5rem;
            font-weight: bold;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
        `;
        achievement.textContent = message;
        document.body.appendChild(achievement);
        
        setTimeout(() => {
            document.body.removeChild(achievement);
        }, 3000);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Data persistence methods
    loadGameState() {
        try {
            const saved = localStorage.getItem('autumnBurstGameState');
            if (saved) {
                const savedState = JSON.parse(saved);
                // Merge saved state with defaults, preserving new properties
                this.gameState = { ...this.gameState, ...savedState };
                
                // Update theme-specific properties
                if (this.themes[this.gameState.currentTheme]) {
                    this.icons = this.themes[this.gameState.currentTheme].icons;
                    this.iconColors = this.themes[this.gameState.currentTheme].colors;
                }
            }
        } catch (error) {
            console.warn('Failed to load game state:', error);
        }
    }
    
    saveGameState() {
        try {
            localStorage.setItem('autumnBurstGameState', JSON.stringify(this.gameState));
        } catch (error) {
            console.warn('Failed to save game state:', error);
        }
    }
    
    // Achievement system
    unlockAchievement(id, name, description) {
        if (!this.gameState.achievements.find(a => a.id === id)) {
            this.gameState.achievements.push({
                id,
                name,
                description,
                unlockedAt: new Date().toISOString()
            });
            this.showAchievement(`🏆 ${name}`);
            this.saveGameState();
            return true;
        }
        return false;
    }
    
    checkAchievements() {
        const score = this.score;
        const level = this.gameState.level;
        const gamesPlayed = this.gameState.totalGamesPlayed;
        
        // Score-based achievements
        if (score >= 1000) this.unlockAchievement('score_1k', 'Autumn Master', 'Reach 1,000 points');
        if (score >= 5000) this.unlockAchievement('score_5k', 'Leaf Legend', 'Reach 5,000 points');
        if (score >= 10000) this.unlockAchievement('score_10k', 'Harvest Hero', 'Reach 10,000 points');
        
        // Combo achievements
        if (this.combo >= 5) this.unlockAchievement('combo_5', 'Combo Master', 'Achieve 5x combo');
        if (this.combo >= 10) this.unlockAchievement('combo_10', 'Chain Champion', 'Achieve 10x combo');
        
        // Level achievements
        if (level >= 5) this.unlockAchievement('level_5', 'Rising Star', 'Reach level 5');
        if (level >= 10) this.unlockAchievement('level_10', 'Seasoned Player', 'Reach level 10');
        
        // Games played achievements
        if (gamesPlayed >= 10) this.unlockAchievement('games_10', 'Dedicated Player', 'Play 10 games');
        if (gamesPlayed >= 50) this.unlockAchievement('games_50', 'Autumn Addict', 'Play 50 games');
        
        // Unlock new themes based on achievements
        if (this.gameState.achievements.length >= 3 && !this.gameState.unlockedThemes.includes('halloween')) {
            this.gameState.unlockedThemes.push('halloween');
            this.showAchievement('🎃 Halloween Theme Unlocked!');
        }
        
        if (this.gameState.achievements.length >= 6 && !this.gameState.unlockedThemes.includes('thanksgiving')) {
            this.gameState.unlockedThemes.push('thanksgiving');
            this.showAchievement('🦃 Thanksgiving Theme Unlocked!');
        }
        
        if (this.gameState.achievements.length >= 10 && !this.gameState.unlockedThemes.includes('harvest')) {
            this.gameState.unlockedThemes.push('harvest');
            this.showAchievement('🌾 Harvest Theme Unlocked!');
        }
    }
    
    // XP and leveling system
    addXP(amount) {
        this.gameState.xp += amount;
        const newLevel = Math.floor(this.gameState.xp / 1000) + 1;
        
        if (newLevel > this.gameState.level) {
            this.gameState.level = newLevel;
            this.showAchievement(`🌟 Level ${newLevel}!`);
            
            // Award power-ups on level up
            this.gameState.powerUps.goldenLeaf += 1;
            if (newLevel % 3 === 0) this.gameState.powerUps.harvestMoon += 1;
            if (newLevel % 5 === 0) this.gameState.powerUps.autumnWind += 1;
            if (newLevel % 7 === 0) this.gameState.powerUps.frostTouch += 1;
            if (newLevel % 10 === 0) this.gameState.powerUps.cornucopia += 1;
        }
        
        this.saveGameState();
    }
    
    // Theme switching
    switchTheme(themeName) {
        if (this.themes[themeName] && this.gameState.unlockedThemes.includes(themeName)) {
            this.gameState.currentTheme = themeName;
            this.icons = this.themes[themeName].icons;
            this.iconColors = this.themes[themeName].colors;
            this.saveGameState();
            this.restart(); // Restart with new theme
            return true;
        }
        return false;
    }
    
    // Progressive Power-ups System
    usePowerUp(powerUpType) {
        if (this.gameState.powerUps[powerUpType] <= 0 || this.animating) {
            return false;
        }
        
        this.gameState.powerUps[powerUpType]--;
        this.saveGameState();
        
        switch (powerUpType) {
            case 'goldenLeaf':
                return this.activateGoldenLeafBomb();
            case 'harvestMoon':
                return this.activateHarvestMoon();
            case 'autumnWind':
                return this.activateAutumnWind();
            case 'frostTouch':
                return this.activateFrostTouch();
            case 'cornucopia':
                return this.activateCornucopia();
            default:
                return false;
        }
    }
    
    // Golden Leaf Bomb: Clears all adjacent icons
    activateGoldenLeafBomb() {
        if (!this.selectedCell) {
            this.showAchievement('Select a cell first! 🍂');
            this.gameState.powerUps.goldenLeaf++; // Refund
            return false;
        }
        
        const { row, col } = this.selectedCell;
        const cellsToClear = [];
        
        // Get all adjacent cells (including diagonals)
        for (let r = Math.max(0, row - 1); r <= Math.min(this.gridSize - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.gridSize - 1, col + 1); c++) {
                if (this.grid[r][c]) {
                    cellsToClear.push({ row: r, col: c });
                }
            }
        }
        
        // Create burst effects and clear cells
        cellsToClear.forEach(cell => {
            this.createBurstEffect(cell.row, cell.col, this.grid[cell.row][cell.col]);
            this.grid[cell.row][cell.col] = null;
        });
        
        // Award points
        const points = cellsToClear.length * 50;
        this.score += points;
        this.addXP(points);
        
        this.selectedCell = null;
        this.showAchievement('🍂 Golden Leaf Bomb!');
        
        // Apply gravity and continue game
        setTimeout(() => {
            this.applyGravity();
            this.fillGrid();
            this.checkAndProcessMatches();
        }, 500);
        
        return true;
    }
    
    // Harvest Moon: Transforms random icons to match your selection
    activateHarvestMoon() {
        if (!this.selectedCell) {
            this.showAchievement('Select a cell first! 🌙');
            this.gameState.powerUps.harvestMoon++; // Refund
            return false;
        }
        
        const targetIcon = this.grid[this.selectedCell.row][this.selectedCell.col];
        if (!targetIcon) {
            this.gameState.powerUps.harvestMoon++; // Refund
            return false;
        }
        
        // Find 3-5 random icons to transform
        const transformCount = 3 + Math.floor(Math.random() * 3);
        const cellsToTransform = [];
        
        for (let attempts = 0; attempts < transformCount * 3 && cellsToTransform.length < transformCount; attempts++) {
            const row = Math.floor(Math.random() * this.gridSize);
            const col = Math.floor(Math.random() * this.gridSize);
            
            if (this.grid[row][col] && this.grid[row][col] !== targetIcon &&
                !cellsToTransform.some(cell => cell.row === row && cell.col === col)) {
                cellsToTransform.push({ row, col });
            }
        }
        
        // Transform icons with visual effect
        cellsToTransform.forEach(cell => {
            this.createBurstEffect(cell.row, cell.col, this.grid[cell.row][cell.col]);
            this.grid[cell.row][cell.col] = targetIcon;
        });
        
        this.selectedCell = null;
        this.showAchievement('🌙 Harvest Moon!');
        
        // Check for matches after transformation
        setTimeout(() => {
            this.checkAndProcessMatches();
        }, 600);
        
        return true;
    }
    
    // Autumn Wind: Shuffles the board when stuck
    activateAutumnWind() {
        // Collect all non-null icons
        const icons = [];
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    icons.push(this.grid[row][col]);
                    this.grid[row][col] = null;
                }
            }
        }
        
        // Shuffle the icons array
        for (let i = icons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [icons[i], icons[j]] = [icons[j], icons[i]];
        }
        
        // Place shuffled icons back
        let iconIndex = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (iconIndex < icons.length) {
                    this.grid[row][col] = icons[iconIndex++];
                }
            }
        }
        
        this.selectedCell = null;
        this.showAchievement('🌪️ Autumn Wind!');
        
        // Check for immediate matches after shuffle
        setTimeout(() => {
            this.checkAndProcessMatches();
        }, 300);
        
        return true;
    }
    
    // Frost Touch: Freezes time for strategic planning
    activateFrostTouch() {
        this.gameRunning = false;
        this.showAchievement('❄️ Time Frozen! Click to continue');
        
        // Add click listener to unfreeze
        const unfreezeHandler = () => {
            this.gameRunning = true;
            this.gameLoop();
            this.showAchievement('⏰ Time Resumed!');
            this.canvas.removeEventListener('click', unfreezeHandler);
        };
        
        this.canvas.addEventListener('click', unfreezeHandler);
        return true;
    }
    
    // Cornucopia: Wild card that matches anything
    activateCornucopia() {
        if (!this.selectedCell) {
            this.showAchievement('Select a cell first! 🌽');
            this.gameState.powerUps.cornucopia++; // Refund
            return false;
        }
        
        // Replace selected cell with a special wild icon
        this.grid[this.selectedCell.row][this.selectedCell.col] = '🌽'; // Temporary wild icon
        
        // Find all adjacent clusters and merge them
        const adjacentCells = [
            { row: this.selectedCell.row - 1, col: this.selectedCell.col },
            { row: this.selectedCell.row + 1, col: this.selectedCell.col },
            { row: this.selectedCell.row, col: this.selectedCell.col - 1 },
            { row: this.selectedCell.row, col: this.selectedCell.col + 1 }
        ];
        
        const cellsToClear = [this.selectedCell];
        
        adjacentCells.forEach(cell => {
            if (cell.row >= 0 && cell.row < this.gridSize && 
                cell.col >= 0 && cell.col < this.gridSize && 
                this.grid[cell.row][cell.col]) {
                
                const visited = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(false));
                const cluster = this.findCluster(cell.row, cell.col, this.grid[cell.row][cell.col], visited);
                cellsToClear.push(...cluster);
            }
        });
        
        // Remove duplicates
        const uniqueCells = cellsToClear.filter((cell, index, self) =>
            index === self.findIndex(c => c.row === cell.row && c.col === cell.col)
        );
        
        // Create burst effects and clear
        uniqueCells.forEach(cell => {
            this.createBurstEffect(cell.row, cell.col, this.grid[cell.row][cell.col]);
            this.grid[cell.row][cell.col] = null;
        });
        
        const points = uniqueCells.length * 75;
        this.score += points;
        this.addXP(points);
        
        this.selectedCell = null;
        this.showAchievement('🌽 Cornucopia Magic!');
        
        setTimeout(() => {
            this.applyGravity();
            this.fillGrid();
            this.checkAndProcessMatches();
        }, 600);
        
        return true;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new AutumnBurstGame();
});