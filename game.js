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

        // Falling piece properties
        this.fallingPiece = null;
        this.fallingX = 0;
        this.fallingY = 0;
        this.fallSpeed = 500; // milliseconds between drops
        this.lastFall = 0;

        // Next pieces queue
        this.nextPieces = [];

        // Audio context for sound effects
        this.audioContext = null;
        this.soundEnabled = true;

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

        this.initAudio();
        this.init();
        this.setupEventListeners();
        this.gameLoop();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.soundEnabled = false;
        }
    }

    playSound(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.soundEnabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;

            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }

    playPiecePlace() {
        this.playSound(220, 0.1, 'square', 0.05);
    }

    playBurst() {
        this.playSound(440, 0.2, 'sawtooth', 0.08);
        setTimeout(() => this.playSound(550, 0.15, 'sawtooth', 0.06), 50);
    }

    playCombo() {
        this.playSound(660, 0.3, 'triangle', 0.1);
        setTimeout(() => this.playSound(880, 0.2, 'triangle', 0.08), 100);
    }

    playGameOver() {
        this.playSound(220, 0.5, 'sawtooth', 0.05);
        setTimeout(() => this.playSound(196, 0.8, 'sawtooth', 0.03), 200);
    }

    playMove() {
        this.playSound(330, 0.05, 'sine', 0.02);
    }
    
    init() {
        // Initialize empty grid
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));

        // Initialize next pieces queue
        this.nextPieces = [];
        for (let i = 0; i < 5; i++) {
            this.nextPieces.push(this.getRandomIcon());
        }

        this.spawnNewPiece();
        this.updateDisplay();
    }

    spawnNewPiece() {
        // Get the next piece from the queue
        this.fallingPiece = this.nextPieces.shift();

        // Add a new piece to the end of the queue
        this.nextPieces.push(this.getRandomIcon());

        this.fallingX = Math.floor(this.gridSize / 2);
        this.fallingY = 0;
    }

    getRandomIcon() {
        return this.icons[Math.floor(Math.random() * this.icons.length)];
    }
    
    getRandomIcon() {
        return this.icons[Math.floor(Math.random() * this.icons.length)];
    }
    
    setupEventListeners() {
        // Keyboard controls for moving falling pieces
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Click to drop piece instantly
        this.canvas.addEventListener('click', (e) => this.dropPiece());

        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('newGameBtn').addEventListener('click', () => this.restart());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    }

    handleKeyPress(e) {
        if (!this.gameRunning || this.animating) return;

        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.movePiece(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.movePiece(1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.dropPiece();
                break;
        }
    }

    movePiece(dx) {
        const newX = this.fallingX + dx;
        if (newX >= 0 && newX < this.gridSize && !this.grid[this.fallingY][newX]) {
            this.fallingX = newX;
            this.playMove();
        }
    }

    dropPiece() {
        if (!this.gameRunning || this.animating) return;

        // Drop the piece to the bottom
        while (!this.checkCollision(this.fallingY + 1, this.fallingX)) {
            this.fallingY++;
        }

        // Place the piece
        this.placePiece();
    }

    checkCollision(y, x) {
        // Check if piece would collide at given position
        return y >= this.gridSize || (this.grid[y] && this.grid[y][x]);
    }

    placePiece() {
        // Place the falling piece on the grid
        this.grid[this.fallingY][this.fallingX] = this.fallingPiece;
        this.playPiecePlace();

        // Check for matches and burst them
        this.checkAndProcessMatches();

        // Spawn new piece
        this.spawnNewPiece();

        // Check if new piece spawns in occupied space (game over)
        if (this.checkCollision(this.fallingY, this.fallingX)) {
            this.gameOver();
        }
    }

    update() {
        const currentTime = Date.now();

        if (currentTime - this.lastFall > this.fallSpeed) {
            if (!this.checkCollision(this.fallingY + 1, this.fallingX)) {
                this.fallingY++;
            } else {
                this.placePiece();
            }
            this.lastFall = currentTime;
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

        // Draw ghost preview (where piece will land)
        this.drawGhostPreview();

        // Draw placed icons
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    const x = col * this.cellSize + this.cellSize / 2;
                    const y = row * this.cellSize + this.cellSize / 2;

                    // Draw icon background (same as game table)
                    this.ctx.fillStyle = '#F4E4BC';
                    this.ctx.fillRect(col * this.cellSize + 2, row * this.cellSize + 2,
                                    this.cellSize - 4, this.cellSize - 4);

                    // Draw icon
                    this.ctx.fillText(this.grid[row][col], x, y);
                }
            }
        }

        // Draw falling piece
        if (this.fallingPiece) {
            const x = this.fallingX * this.cellSize + this.cellSize / 2;
            const y = this.fallingY * this.cellSize + this.cellSize / 2;

            // Draw falling piece background (same as game table)
            this.ctx.fillStyle = '#F4E4BC';
            this.ctx.fillRect(this.fallingX * this.cellSize + 2, this.fallingY * this.cellSize + 2,
                            this.cellSize - 4, this.cellSize - 4);

            // Draw falling piece
            this.ctx.fillText(this.fallingPiece, x, y);
        }
    }

    drawGhostPreview() {
        if (!this.fallingPiece) return;

        // Calculate where the piece will land
        let ghostY = this.fallingY;
        while (!this.checkCollision(ghostY + 1, this.fallingX)) {
            ghostY++;
        }

        // Don't draw ghost if it's at the same position as falling piece
        if (ghostY === this.fallingY) return;

        const x = this.fallingX * this.cellSize + this.cellSize / 2;
        const y = ghostY * this.cellSize + this.cellSize / 2;

        // Draw ghost piece with transparency
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#F4E4BC';
        this.ctx.fillRect(this.fallingX * this.cellSize + 2, ghostY * this.cellSize + 2,
                        this.cellSize - 4, this.cellSize - 4);
        this.ctx.fillText(this.fallingPiece, x, y);
        this.ctx.restore();
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
            this.combo++;
            await this.delay(300);
            this.animating = false;

            // Play combo sound for chain reactions
            if (this.combo > 1) {
                this.playCombo();
            }

            // Check for chain reactions
            setTimeout(() => this.checkAndProcessMatches(), 100);
        } else {
            this.combo = 0;
            this.checkGameOver();
        }
    }    async burstMatches(matches) {
        let totalPoints = 0;

        for (const cluster of matches) {
            const points = cluster.length * 10 * (this.combo + 1);
            totalPoints += points;

            // Remove matched icons
            for (const {row, col} of cluster) {
                this.grid[row][col] = null;
            }
        }

        this.score += totalPoints;
        this.updateDisplay();
        this.drawGrid();

        // Play burst sound
        this.playBurst();

        // Show points animation (simplified)
        await this.delay(200);
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

        // Update next icons preview with actual upcoming pieces
        const nextIconsContainer = document.getElementById('nextIcons');
        nextIconsContainer.innerHTML = '';

        // Show the next 3 pieces from the queue
        for (let i = 0; i < 3 && i < this.nextPieces.length; i++) {
            const iconElement = document.createElement('div');
            iconElement.className = 'next-icon';
            iconElement.textContent = this.nextPieces[i];
            nextIconsContainer.appendChild(iconElement);
        }
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.update();
            this.drawGrid();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    restart() {
        // Reset all game state
        this.score = 0;
        this.combo = 0;
        this.gameRunning = true;
        this.animating = false;
        this.fallingPiece = null;
        this.fallingX = 0;
        this.fallingY = 0;
        this.lastFall = 0;
        this.burstingCells = [];
        this.nextPieces = [];

        // Hide game over overlay
        document.getElementById('gameOverlay').style.display = 'none';

        // Clear grid and start fresh
        this.init();

        // Restart the game loop
        this.gameLoop();
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
        this.playGameOver();
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverlay').style.display = 'flex';
    }
    
    checkGameOver() {
        // Simple game over condition: if score reaches a milestone, show celebration
        // Or if no moves possible (in a more complex version)
        if (this.score >= 1000) {
            this.showAchievement("Autumn Master! 🍂");
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

// Export the game class for ES module use
export { AutumnBurstGame };