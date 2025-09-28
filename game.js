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
        
        // Two-click swapping system
        this.selectedCell = null;
        this.burstParticles = [];
        
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
            // First click - select cell
            this.selectedCell = { row, col };
        } else {
            // Second click - attempt swap
            const { row: selectedRow, col: selectedCol } = this.selectedCell;
            
            if (row === selectedRow && col === selectedCol) {
                // Clicked same cell - deselect
                this.selectedCell = null;
            } else if (this.isAdjacent(selectedRow, selectedCol, row, col)) {
                // Adjacent cells - attempt swap
                this.attemptSwap(selectedRow, selectedCol, row, col);
            } else {
                // Non-adjacent - select new cell
                this.selectedCell = { row, col };
            }
        }
    }
    
    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    async attemptSwap(row1, col1, row2, col2) {
        // Swap the icons
        const temp = this.grid[row1][col1];
        this.grid[row1][col1] = this.grid[row2][col2];
        this.grid[row2][col2] = temp;
        
        // Check if this creates any matches
        const matches = this.findMatches();
        
        if (matches.length > 0) {
            // Valid swap - clear selection and process matches
            this.selectedCell = null;
            this.checkAndProcessMatches();
        } else {
            // Invalid swap - revert and show animation
            this.animating = true;
            await this.delay(150);
            
            // Revert swap
            this.grid[row2][col2] = this.grid[row1][col1];
            this.grid[row1][col1] = temp;
            
            this.selectedCell = null;
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
                    
                    // Highlight selected cell with golden glow
                    if (this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col) {
                        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
                        this.ctx.fillRect(col * this.cellSize + 2, row * this.cellSize + 2, 
                                        this.cellSize - 4, this.cellSize - 4);
                        
                        // Golden border for selected cell
                        this.ctx.strokeStyle = '#FFD700';
                        this.ctx.lineWidth = 3;
                        this.ctx.strokeRect(col * this.cellSize + 2, row * this.cellSize + 2, 
                                          this.cellSize - 4, this.cellSize - 4);
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeStyle = '#8B4513';
                    } else {
                        // Normal icon background
                        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        this.ctx.fillRect(col * this.cellSize + 2, row * this.cellSize + 2, 
                                        this.cellSize - 4, this.cellSize - 4);
                    }
                    
                    // Draw icon
                    this.ctx.fillText(this.grid[row][col], x, y);
                }
            }
        }
        
        // Draw burst particles
        this.drawBurstParticles();
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
            
            // Create scatter particles for each burst icon
            for (const {row, col} of cluster) {
                const x = col * this.cellSize + this.cellSize / 2;
                const y = row * this.cellSize + this.cellSize / 2;
                this.createScatterParticles(x, y, this.grid[row][col]);
                this.grid[row][col] = null;
            }
        }
        
        this.score += totalPoints;
        this.updateDisplay();
        
        // Show burst animation
        await this.delay(400);
    }
    
    createScatterParticles(x, y, icon) {
        const particleCount = 6;
        const iconColor = this.iconColors[icon] || '#FFD700';
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;
            const life = 0.8 + Math.random() * 0.4;
            
            this.burstParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: iconColor,
                size: 4 + Math.random() * 4,
                icon: icon
            });
        }
    }
    
    drawBurstParticles() {
        // Update and draw particles
        for (let i = this.burstParticles.length - 1; i >= 0; i--) {
            const particle = this.burstParticles[i];
            
            // Update particle
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.vy += 0.1; // Gravity effect
            
            // Calculate alpha based on life
            const alpha = particle.life / particle.maxLife;
            const scale = 0.5 + alpha * 0.5;
            
            if (particle.life <= 0) {
                // Remove dead particles
                this.burstParticles.splice(i, 1);
                continue;
            }
            
            // Draw particle as small icon or colored circle
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.translate(particle.x, particle.y);
            this.ctx.scale(scale, scale);
            
            if (alpha > 0.5) {
                // Draw mini icon when still visible
                this.ctx.font = `${particle.size * 2}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(particle.icon, 0, 0);
            } else {
                // Draw colored circle when fading
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        }
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
        this.burstParticles = [];
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

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new AutumnBurstGame();
});