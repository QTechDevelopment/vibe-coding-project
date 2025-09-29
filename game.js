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
        
        // High score system
        this.highScores = this.loadHighScores();
        this.playerName = '';
        
        // On-screen keyboard state
        this.keyboardVisible = false;
        this.keyboardInput = '';
        this.keyboardCallback = null;
        
        // Fall-themed icons with emojis
        this.icons = ['🍂', '🎃', '🌰', '🍎', '🍄', '🌻', '🥧', '📚'];
        this.iconColors = {
            '🍂': '#D2691E', // Orange leaf
            '🎃': '#FF6347', // Pumpkin
            '🌰': '#8B4513', // Acorn
            '🍎': '#DC143C', // Apple
            '🍄': '#CD853F', // Mushroom
            '🌻': '#FFD700', // Sunflower
            '🥧': '#DEB887', // Pie
            '📚': '#4682B4'  // Books
        };
        
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
        
        // High score system event listeners
        document.getElementById('keyboardBtn').addEventListener('click', () => {
            this.showKeyboard((name) => {
                document.getElementById('playerNameInput').value = name;
            });
        });
        document.getElementById('saveScoreBtn').addEventListener('click', () => this.saveHighScore());
        
        // On-screen keyboard event listeners
        this.setupKeyboardEventListeners();
    }
    
    setupKeyboardEventListeners() {
        const keyboard = document.getElementById('onScreenKeyboard');
        const keys = keyboard.querySelectorAll('.key');
        const closeBtn = document.getElementById('closeKeyboard');
        const cancelBtn = document.getElementById('keyboardCancel');
        const doneBtn = document.getElementById('keyboardDone');
        
        keys.forEach(key => {
            key.addEventListener('click', () => this.handleKeyPress(key.dataset.key));
        });
        
        closeBtn.addEventListener('click', () => this.hideKeyboard(false));
        cancelBtn.addEventListener('click', () => this.hideKeyboard(false));
        doneBtn.addEventListener('click', () => this.hideKeyboard(true));
        
        // Prevent keyboard from closing when clicking inside
        keyboard.querySelector('.keyboard-container').addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Close keyboard when clicking outside
        keyboard.addEventListener('click', () => this.hideKeyboard(false));
    }
    
    loadHighScores() {
        try {
            const scores = localStorage.getItem('autumnBurstHighScores');
            return scores ? JSON.parse(scores) : [];
        } catch (e) {
            return [];
        }
    }
    
    saveHighScoreToStorage() {
        try {
            localStorage.setItem('autumnBurstHighScores', JSON.stringify(this.highScores));
        } catch (e) {
            console.warn('Could not save high scores to localStorage');
        }
    }
    
    isHighScore(score) {
        if (this.highScores.length < 5) return true;
        return score > Math.min(...this.highScores.map(hs => hs.score));
    }
    
    showKeyboard(callback) {
        this.keyboardVisible = true;
        this.keyboardInput = '';
        this.keyboardCallback = callback;
        
        const keyboard = document.getElementById('onScreenKeyboard');
        const display = document.getElementById('keyboardInput');
        
        display.textContent = '';
        keyboard.style.display = 'flex';
        
        // Animate in
        setTimeout(() => {
            keyboard.style.opacity = '1';
        }, 10);
    }
    
    hideKeyboard(confirm = false) {
        if (!this.keyboardVisible) return;
        
        const keyboard = document.getElementById('onScreenKeyboard');
        keyboard.style.opacity = '0';
        
        setTimeout(() => {
            keyboard.style.display = 'none';
            this.keyboardVisible = false;
            
            if (confirm && this.keyboardCallback) {
                this.keyboardCallback(this.keyboardInput.trim());
            }
            
            this.keyboardCallback = null;
            this.keyboardInput = '';
        }, 200);
    }
    
    handleKeyPress(key) {
        const display = document.getElementById('keyboardInput');
        
        if (key === 'BACKSPACE') {
            this.keyboardInput = this.keyboardInput.slice(0, -1);
        } else if (key === ' ') {
            if (this.keyboardInput.length < 10 && this.keyboardInput.trim().length > 0) {
                this.keyboardInput += ' ';
            }
        } else if (this.keyboardInput.length < 10) {
            this.keyboardInput += key;
        }
        
        display.textContent = this.keyboardInput;
        
        // Update regular input field if it exists
        const nameInput = document.getElementById('playerNameInput');
        if (nameInput) {
            nameInput.value = this.keyboardInput;
        }
    }
    
    saveHighScore() {
        const nameInput = document.getElementById('playerNameInput');
        const name = nameInput.value.trim() || 'Anonymous';
        
        // Add to high scores
        this.highScores.push({
            name: name,
            score: this.score,
            date: new Date().toLocaleDateString()
        });
        
        // Sort by score (highest first) and keep top 5
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 5);
        
        // Save to localStorage
        this.saveHighScoreToStorage();
        
        // Hide high score section
        document.getElementById('highScoreSection').style.display = 'none';
        
        // Show achievement
        this.showAchievement(`🏆 High Score Saved! 🏆`);
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
            const points = cluster.length * 10 * (this.combo + 1);
            totalPoints += points;
            
            // Create burst effects for each matched icon
            for (const {row, col} of cluster) {
                this.createBurstEffect(row, col, this.grid[row][col]);
                this.grid[row][col] = null;
            }
        }
        
        this.score += totalPoints;
        this.updateDisplay();
        
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
        document.getElementById('score').textContent = this.score;
        document.getElementById('combo').textContent = this.combo + 'x';
        
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
        this.score = 0;
        this.combo = 0;
        this.gameRunning = true;
        this.animating = false;
        this.selectedCell = null;
        this.burstingCells = [];
        this.playerName = '';
        
        // Hide overlays
        document.getElementById('gameOverlay').style.display = 'none';
        document.getElementById('highScoreSection').style.display = 'none';
        document.getElementById('onScreenKeyboard').style.display = 'none';
        this.keyboardVisible = false;
        
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
        
        // Check if it's a high score
        if (this.isHighScore(this.score)) {
            document.getElementById('highScoreSection').style.display = 'block';
            document.getElementById('playerNameInput').value = '';
        } else {
            document.getElementById('highScoreSection').style.display = 'none';
        }
        
        document.getElementById('gameOverlay').style.display = 'flex';
    }
    
    checkGameOver() {
        // Simple game over condition: if score reaches a milestone, show celebration
        if (this.score >= 1000) {
            this.showAchievement("Autumn Master! 🍂");
        }
        
        // For demo purposes, trigger game over at 500 points
        if (this.score >= 500) {
            setTimeout(() => this.gameOver(), 1000);
        }
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
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new AutumnBurstGame();
});