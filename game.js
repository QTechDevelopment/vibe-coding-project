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
        this.activeAchievements = new Set(); // Track active achievement elements
        this.keyboardSelectedCell = {row: 0, col: 0}; // Track keyboard cursor position
        
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
        
        // Add keyboard controls for accessibility
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Make canvas focusable for keyboard navigation
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.focus();
    }
    
    handleKeyboard(e) {
        if (!this.gameRunning || this.animating) return;
        
        switch(e.code) {
            case 'ArrowUp':
                e.preventDefault();
                this.keyboardSelectedCell.row = Math.max(0, this.keyboardSelectedCell.row - 1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.keyboardSelectedCell.row = Math.min(this.gridSize - 1, this.keyboardSelectedCell.row + 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.keyboardSelectedCell.col = Math.max(0, this.keyboardSelectedCell.col - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.keyboardSelectedCell.col = Math.min(this.gridSize - 1, this.keyboardSelectedCell.col + 1);
                break;
            case 'Space':
            case 'Enter':
                e.preventDefault();
                this.handleKeyboardSelect();
                break;
            case 'KeyP':
                e.preventDefault();
                this.togglePause();
                break;
            case 'KeyR':
                e.preventDefault();
                this.restart();
                break;
        }
    }
    
    handleKeyboardSelect() {
        const {row, col} = this.keyboardSelectedCell;
        
        if (!this.selectedCell) {
            // First selection
            this.selectedCell = {row, col};
        } else {
            // Second selection - try to swap
            if (this.isAdjacent(this.selectedCell, {row, col})) {
                this.swapCells(this.selectedCell, {row, col});
                this.selectedCell = null;
            } else {
                // Select new cell
                this.selectedCell = {row, col};
            }
        }
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
                    }
                    // Highlight keyboard cursor position
                    else if (this.keyboardSelectedCell.row === row && this.keyboardSelectedCell.col === col) {
                        this.ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
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
        this.clearActiveAchievements(); // Clean up any active achievements
        document.getElementById('gameOverlay').style.display = 'none';
        this.init();
    }
    
    togglePause() {
        this.gameRunning = !this.gameRunning;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.gameRunning ? 'Pause' : 'Resume';
        
        if (this.gameRunning) {
            this.hidePauseOverlay();
            this.gameLoop();
        } else {
            this.showPauseOverlay();
        }
    }
    
    showPauseOverlay() {
        // Draw a semi-transparent overlay with pause message
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pause message
        this.ctx.fillStyle = '#DAA520';
        this.ctx.font = 'bold 48px Georgia';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.fillStyle = '#F4E4BC';
        this.ctx.font = '20px Georgia';
        this.ctx.fillText('Click Resume to continue', this.canvas.width / 2, this.canvas.height / 2 + 30);
        this.ctx.restore();
    }
    
    hidePauseOverlay() {
        // Simply redraw the grid to remove the pause overlay
        this.drawGrid();
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverlay').style.display = 'flex';
    }
    
    checkGameOver() {
        // Check for achievement milestones first
        if (this.score >= 1000 && this.score < 1010) {
            this.showAchievement("Autumn Master! 🍂");
        }
        
        // Check if no valid moves are possible
        if (!this.hasValidMoves()) {
            setTimeout(() => this.gameOver(), 1000); // Delay to let final animations complete
        }
    }
    
    hasValidMoves() {
        // Check every cell to see if swapping with adjacent cells creates matches
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                // Check right neighbor
                if (col < this.gridSize - 1) {
                    if (this.wouldSwapCreateMatch(row, col, row, col + 1)) {
                        return true;
                    }
                }
                // Check bottom neighbor
                if (row < this.gridSize - 1) {
                    if (this.wouldSwapCreateMatch(row, col, row + 1, col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    wouldSwapCreateMatch(row1, col1, row2, col2) {
        // Temporarily swap the icons
        const temp = this.grid[row1][col1];
        this.grid[row1][col1] = this.grid[row2][col2];
        this.grid[row2][col2] = temp;
        
        // Check if this creates any matches
        const matches = this.findMatches();
        const hasMatches = matches.length > 0;
        
        // Swap back
        this.grid[row2][col2] = this.grid[row1][col1];
        this.grid[row1][col1] = temp;
        
        return hasMatches;
    }
    
    showAchievement(message) {
        // Create a temporary achievement display
        const achievement = document.createElement('div');
        achievement.className = 'achievement-popup'; // Add class for easier cleanup
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
        
        // Track this achievement element
        this.activeAchievements.add(achievement);
        
        setTimeout(() => {
            // Safe removal with error handling
            if (achievement.parentNode && this.activeAchievements.has(achievement)) {
                document.body.removeChild(achievement);
                this.activeAchievements.delete(achievement);
            }
        }, 3000);
    }
    
    // Clean up method for when game restarts
    clearActiveAchievements() {
        this.activeAchievements.forEach(achievement => {
            if (achievement.parentNode) {
                document.body.removeChild(achievement);
            }
        });
        this.activeAchievements.clear();
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new AutumnBurstGame();
});