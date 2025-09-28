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
        this.nextIcons = []; // Add queue for next icons
        
        // Selection state for swapping
        this.selectedCell = null;
        this.particleEffects = [];
        
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
        // Initialize next icons queue
        this.nextIcons = Array(3).fill().map(() => this.getRandomIcon());
        this.fillGrid();
        this.updateDisplay();
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
    }
    
    handleClick(e) {
        if (!this.gameRunning || this.animating) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            this.handleCellClick(row, col);
        }
    }
    
    handleCellClick(row, col) {
        if (!this.selectedCell) {
            // First click - select the cell
            this.selectedCell = { row, col };
            console.log(`Selected cell: (${row}, ${col})`);
        } else {
            // Second click - attempt to swap
            if (this.selectedCell.row === row && this.selectedCell.col === col) {
                // Same cell clicked - deselect
                this.selectedCell = null;
                console.log('Deselected cell');
            } else if (this.areAdjacent(this.selectedCell, { row, col })) {
                // Adjacent cell - attempt swap
                console.log(`Attempting swap: (${this.selectedCell.row}, ${this.selectedCell.col}) with (${row}, ${col})`);
                this.attemptSwap(this.selectedCell, { row, col });
            } else {
                // Non-adjacent cell - select new cell
                this.selectedCell = { row, col };
                console.log(`Selected new cell: (${row}, ${col})`);
            }
        }
    }
    
    areAdjacent(cell1, cell2) {
        const rowDiff = Math.abs(cell1.row - cell2.row);
        const colDiff = Math.abs(cell1.col - cell2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    async attemptSwap(cell1, cell2) {
        // Swap the icons
        const temp = this.grid[cell1.row][cell1.col];
        this.grid[cell1.row][cell1.col] = this.grid[cell2.row][cell2.col];
        this.grid[cell2.row][cell2.col] = temp;
        
        // Check if this swap creates matches
        const matches = this.findMatches();
        
        if (matches.length > 0) {
            // Valid swap - clear selection and process matches
            this.selectedCell = null;
            this.drawGrid();
            await this.delay(200);
            this.checkAndProcessMatches();
        } else {
            // Invalid swap - revert the swap
            const temp2 = this.grid[cell1.row][cell1.col];
            this.grid[cell1.row][cell1.col] = this.grid[cell2.row][cell2.col];
            this.grid[cell2.row][cell2.col] = temp2;
            
            // Show brief swap animation then revert
            this.drawGrid();
            await this.delay(300);
            this.drawGrid();
            
            // Clear selection
            this.selectedCell = null;
            console.log('Invalid swap - no matches created');
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
                    
                    // Highlight selected cell with golden glow
                    if (this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col) {
                        this.ctx.shadowColor = '#FFD700';
                        this.ctx.shadowBlur = 15;
                        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                        this.ctx.fillRect(col * this.cellSize + 2, row * this.cellSize + 2, 
                                        this.cellSize - 4, this.cellSize - 4);
                    } else {
                        this.ctx.shadowBlur = 0;
                        // Draw normal icon background
                        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        this.ctx.fillRect(col * this.cellSize + 2, row * this.cellSize + 2, 
                                        this.cellSize - 4, this.cellSize - 4);
                    }
                    
                    // Draw icon
                    this.ctx.fillStyle = '#000';
                    this.ctx.shadowBlur = 0;
                    this.ctx.fillText(this.grid[row][col], x, y);
                }
            }
        }
        
        // Draw particle effects
        this.updateParticles();
    }
    
    updateParticles() {
        this.particleEffects = this.particleEffects.filter(effect => {
            for (let particle of effect.particles) {
                // Update particle position
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1; // gravity
                particle.life -= 0.02;
                particle.scale *= 0.98;
                
                if (particle.life > 0) {
                    // Draw particle
                    this.ctx.save();
                    this.ctx.globalAlpha = particle.life;
                    this.ctx.translate(particle.x, particle.y);
                    this.ctx.scale(particle.scale, particle.scale);
                    this.ctx.font = '20px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillStyle = particle.color;
                    this.ctx.fillText(particle.icon, 0, 0);
                    this.ctx.restore();
                }
            }
            
            // Keep effect if any particles are still alive
            return effect.particles.some(p => p.life > 0);
        });
    }
    
    createScatteringEffect(row, col, icon) {
        const centerX = col * this.cellSize + this.cellSize / 2;
        const centerY = row * this.cellSize + this.cellSize / 2;
        
        const particles = [];
        const colors = ['#FF6B35', '#FFD700', '#DC143C', '#8B4513', '#FF8C00'];
        
        // Create 6 particles scattering in different directions
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            
            particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                icon: icon,
                life: 1.0,
                scale: 1.0,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
        
        this.particleEffects.push({ particles });
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
            await this.delay(100);
            await this.checkAndProcessMatches();
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
            
            // Create scattering effects for each matched icon
            for (const {row, col} of cluster) {
                this.createScatteringEffect(row, col, this.grid[row][col]);
                this.grid[row][col] = null;
            }
        }
        
        this.score += totalPoints;
        this.updateDisplay();
        this.drawGrid();
        
        // Wait for scattering animation
        await this.delay(400);
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
        
        // Rotate the next icons queue
        if (this.nextIcons.length < 3) {
            this.nextIcons.push(this.getRandomIcon());
        }
        
        for (let i = 0; i < 3; i++) {
            const iconElement = document.createElement('div');
            iconElement.className = 'next-icon';
            iconElement.textContent = this.nextIcons[i] || this.getRandomIcon();
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
        this.particleEffects = [];
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
        // Check if no more moves are possible (simplified version)
        const possibleMatches = this.findMatches();
        
        // Show achievement milestones
        if (this.score >= 1000 && this.score < 1010) {
            this.showAchievement("Autumn Master! 🍂");
        } else if (this.score >= 2000 && this.score < 2010) {
            this.showAchievement("Fall Legend! 🎃");
        } else if (this.score >= 5000 && this.score < 5010) {
            this.showAchievement("Season Champion! 🏆");
        }
        
        // In a more complex version, check if no more moves are possible
        // For now, the game continues indefinitely as matches always appear
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