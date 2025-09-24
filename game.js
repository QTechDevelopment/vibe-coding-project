// Autumn Burst Game - Fall themed block bursting game
class AutumnBurstGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // Game dimensions
        this.GRID_WIDTH = 12;
        this.GRID_HEIGHT = 16;
        this.CELL_SIZE = 40;
        
        // Fall-themed icons with 24-bit retro colors
        this.ICONS = {
            PUMPKIN: { emoji: '🎃', color: '#FF8C00', bgColor: '#FF4500' },
            TURKEY: { emoji: '🦃', color: '#8B4513', bgColor: '#A0522D' },
            SKELETON: { emoji: '💀', color: '#F5F5DC', bgColor: '#DCDCDC' },
            CANDLE: { emoji: '🕯️', color: '#FFD700', bgColor: '#FFA500' },
            CANDY: { emoji: '🍬', color: '#FF69B4', bgColor: '#FF1493' },
            LEAF: { emoji: '🍂', color: '#CD853F', bgColor: '#D2691E' }
        };
        
        // Burst animation state
        this.burstingCells = new Set();
        this.burstAnimationTimer = 0;
        
        this.iconTypes = Object.keys(this.ICONS);
        
        // Game state
        this.grid = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.dropTimer = 0;
        this.dropInterval = 1000; // milliseconds
        this.gameRunning = false;
        this.paused = false;
        
        this.initializeGrid();
        this.bindEvents();
        this.generateNextPiece();
        this.spawnNewPiece();
        this.render();
    }
    
    initializeGrid() {
        this.grid = [];
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                this.grid[y][x] = null;
            }
        }
    }
    
    generateNextPiece() {
        // Generate a random 2x2 block with fall icons
        const piece = {
            x: Math.floor(this.GRID_WIDTH / 2) - 1,
            y: 0,
            blocks: []
        };
        
        // Create 2x2 pattern with random icons
        for (let y = 0; y < 2; y++) {
            piece.blocks[y] = [];
            for (let x = 0; x < 2; x++) {
                const randomIcon = this.iconTypes[Math.floor(Math.random() * this.iconTypes.length)];
                piece.blocks[y][x] = randomIcon;
            }
        }
        
        return piece;
    }
    
    spawnNewPiece() {
        this.currentPiece = this.nextPiece || this.generateNextPiece();
        this.nextPiece = this.generateNextPiece();
        
        // Check for game over
        if (!this.isValidPosition(this.currentPiece)) {
            this.gameOver();
            return;
        }
        
        this.renderNextPiece();
    }
    
    isValidPosition(piece) {
        for (let y = 0; y < piece.blocks.length; y++) {
            for (let x = 0; x < piece.blocks[y].length; x++) {
                if (piece.blocks[y][x]) {
                    const newX = piece.x + x;
                    const newY = piece.y + y;
                    
                    if (newX < 0 || newX >= this.GRID_WIDTH || 
                        newY >= this.GRID_HEIGHT ||
                        (newY >= 0 && this.grid[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placePiece() {
        for (let y = 0; y < this.currentPiece.blocks.length; y++) {
            for (let x = 0; x < this.currentPiece.blocks[y].length; x++) {
                if (this.currentPiece.blocks[y][x]) {
                    const gridX = this.currentPiece.x + x;
                    const gridY = this.currentPiece.y + y;
                    if (gridY >= 0) {
                        this.grid[gridY][gridX] = this.currentPiece.blocks[y][x];
                    }
                }
            }
        }
        
        // Check for bursts after placing piece
        this.checkForBursts();
        this.spawnNewPiece();
    }
    
    checkForBursts() {
        const visited = Array(this.GRID_HEIGHT).fill().map(() => Array(this.GRID_WIDTH).fill(false));
        let totalBursts = 0;
        let burstGroups = [];
        
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                if (this.grid[y][x] && !visited[y][x]) {
                    const group = this.findConnectedGroup(x, y, this.grid[y][x], visited);
                    if (group.length >= 4) {
                        burstGroups.push(group);
                        totalBursts += group.length;
                    }
                }
            }
        }
        
        // Remove burst groups and calculate score
        if (burstGroups.length > 0) {
            // Mark cells for burst animation
            burstGroups.forEach(group => {
                group.forEach(pos => {
                    this.burstingCells.add(`${pos.x},${pos.y}`);
                });
            });
            
            // Animate burst and then remove
            this.burstAnimationTimer = 300;
            setTimeout(() => {
                burstGroups.forEach(group => {
                    group.forEach(pos => {
                        this.grid[pos.y][pos.x] = null;
                        this.burstingCells.delete(`${pos.x},${pos.y}`);
                    });
                });
                
                // Apply gravity after bursts
                this.applyGravity();
                
                // Check for chain reactions
                setTimeout(() => this.checkForBursts(), 100);
            }, 300);
            
            // Score based on cluster size and number of clusters
            const baseScore = totalBursts * 10;
            const bonusScore = burstGroups.length * 50;
            const comboBonus = burstGroups.reduce((sum, group) => {
                return sum + Math.max(0, (group.length - 4) * 20);
            }, 0);
            this.score += baseScore + bonusScore + comboBonus;
        }
        
        this.updateUI();
    }
    
    findConnectedGroup(startX, startY, iconType, visited) {
        const group = [];
        const stack = [{x: startX, y: startY}];
        
        while (stack.length > 0) {
            const {x, y} = stack.pop();
            
            if (x < 0 || x >= this.GRID_WIDTH || y < 0 || y >= this.GRID_HEIGHT ||
                visited[y][x] || this.grid[y][x] !== iconType) {
                continue;
            }
            
            visited[y][x] = true;
            group.push({x, y});
            
            // Check all 4 directions
            stack.push({x: x + 1, y});
            stack.push({x: x - 1, y});
            stack.push({x, y: y + 1});
            stack.push({x, y: y - 1});
        }
        
        return group;
    }
    
    applyGravity() {
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            let writePos = this.GRID_HEIGHT - 1;
            
            for (let y = this.GRID_HEIGHT - 1; y >= 0; y--) {
                if (this.grid[y][x]) {
                    if (y !== writePos) {
                        this.grid[writePos][x] = this.grid[y][x];
                        this.grid[y][x] = null;
                    }
                    writePos--;
                }
            }
        }
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece || this.paused) return;
        
        const newPiece = {
            ...this.currentPiece,
            x: this.currentPiece.x + dx,
            y: this.currentPiece.y + dy
        };
        
        if (this.isValidPosition(newPiece)) {
            this.currentPiece = newPiece;
            this.render();
        }
    }
    
    rotatePiece() {
        if (!this.currentPiece || this.paused) return;
        
        // Rotate 2x2 block 90 degrees clockwise
        const rotated = {
            ...this.currentPiece,
            blocks: [
                [this.currentPiece.blocks[1][0], this.currentPiece.blocks[0][0]],
                [this.currentPiece.blocks[1][1], this.currentPiece.blocks[0][1]]
            ]
        };
        
        if (this.isValidPosition(rotated)) {
            this.currentPiece = rotated;
            this.render();
        }
    }
    
    dropPiece() {
        if (!this.currentPiece || this.paused) return;
        
        const newPiece = {
            ...this.currentPiece,
            y: this.currentPiece.y + 1
        };
        
        if (this.isValidPosition(newPiece)) {
            this.currentPiece = newPiece;
        } else {
            this.placePiece();
        }
        this.render();
    }
    
    hardDrop() {
        if (!this.currentPiece || this.paused) return;
        
        while (this.isValidPosition({
            ...this.currentPiece,
            y: this.currentPiece.y + 1
        })) {
            this.currentPiece.y++;
        }
        this.placePiece();
    }
    
    update(deltaTime) {
        if (!this.gameRunning || this.paused) return;
        
        // Update burst animation
        if (this.burstAnimationTimer > 0) {
            this.burstAnimationTimer -= deltaTime;
        }
        
        this.dropTimer += deltaTime;
        if (this.dropTimer >= this.dropInterval) {
            this.dropPiece();
            this.dropTimer = 0;
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#2F1B14';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw placed pieces
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                if (this.grid[y][x]) {
                    this.drawIcon(x, y, this.grid[y][x]);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.blocks.length; y++) {
                for (let x = 0; x < this.currentPiece.blocks[y].length; x++) {
                    if (this.currentPiece.blocks[y][x]) {
                        this.drawIcon(
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.currentPiece.blocks[y][x]
                        );
                    }
                }
            }
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#4A4A4A';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.GRID_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.CELL_SIZE, 0);
            this.ctx.lineTo(x * this.CELL_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.GRID_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.CELL_SIZE);
            this.ctx.lineTo(this.canvas.width, y * this.CELL_SIZE);
            this.ctx.stroke();
        }
    }
    
    drawIcon(x, y, iconType) {
        const icon = this.ICONS[iconType];
        const pixelX = x * this.CELL_SIZE;
        const pixelY = y * this.CELL_SIZE;
        
        // Check if this cell is bursting
        const isBursting = this.burstingCells.has(`${x},${y}`);
        const burstProgress = isBursting ? (300 - this.burstAnimationTimer) / 300 : 0;
        
        // Draw background with gradient
        const gradient = this.ctx.createLinearGradient(
            pixelX, pixelY, pixelX + this.CELL_SIZE, pixelY + this.CELL_SIZE
        );
        
        if (isBursting) {
            // Burst animation - flash white/yellow
            const flashColor = burstProgress < 0.5 ? '#FFFF00' : '#FFFFFF';
            gradient.addColorStop(0, flashColor);
            gradient.addColorStop(1, flashColor);
        } else {
            gradient.addColorStop(0, icon.color);
            gradient.addColorStop(1, icon.bgColor);
        }
        
        this.ctx.fillStyle = gradient;
        
        // Scale effect during burst
        const scale = isBursting ? 1 + (Math.sin(burstProgress * Math.PI * 4) * 0.2) : 1;
        const scaledSize = this.CELL_SIZE * scale;
        const offset = (this.CELL_SIZE - scaledSize) / 2;
        
        this.ctx.fillRect(
            pixelX + 2 + offset, 
            pixelY + 2 + offset, 
            scaledSize - 4, 
            scaledSize - 4
        );
        
        // Draw border
        this.ctx.strokeStyle = isBursting ? '#FFD700' : '#8B4513';
        this.ctx.lineWidth = isBursting ? 3 : 2;
        this.ctx.strokeRect(
            pixelX + 2 + offset, 
            pixelY + 2 + offset, 
            scaledSize - 4, 
            scaledSize - 4
        );
        
        // Draw emoji icon
        this.ctx.font = `${scaledSize * 0.6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = isBursting ? '#000' : '#000';
        this.ctx.fillText(
            icon.emoji,
            pixelX + this.CELL_SIZE / 2,
            pixelY + this.CELL_SIZE / 2
        );
        
        // Add burst particles effect
        if (isBursting && burstProgress > 0.3) {
            this.drawBurstParticles(pixelX + this.CELL_SIZE / 2, pixelY + this.CELL_SIZE / 2, burstProgress);
        }
    }
    
    drawBurstParticles(centerX, centerY, progress) {
        const particleCount = 8;
        const maxRadius = 30;
        const currentRadius = progress * maxRadius;
        
        this.ctx.save();
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * currentRadius;
            const y = centerY + Math.sin(angle) * currentRadius;
            
            this.ctx.fillStyle = `rgba(255, 215, 0, ${1 - progress})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3 * (1 - progress), 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }
    
    renderNextPiece() {
        this.nextCtx.fillStyle = '#2F1B14';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const cellSize = 30;
            const offsetX = (this.nextCanvas.width - 2 * cellSize) / 2;
            const offsetY = (this.nextCanvas.height - 2 * cellSize) / 2;
            
            for (let y = 0; y < 2; y++) {
                for (let x = 0; x < 2; x++) {
                    if (this.nextPiece.blocks[y][x]) {
                        const icon = this.ICONS[this.nextPiece.blocks[y][x]];
                        const pixelX = offsetX + x * cellSize;
                        const pixelY = offsetY + y * cellSize;
                        
                        // Draw background
                        const gradient = this.nextCtx.createLinearGradient(
                            pixelX, pixelY, pixelX + cellSize, pixelY + cellSize
                        );
                        gradient.addColorStop(0, icon.color);
                        gradient.addColorStop(1, icon.bgColor);
                        
                        this.nextCtx.fillStyle = gradient;
                        this.nextCtx.fillRect(pixelX, pixelY, cellSize, cellSize);
                        
                        // Draw border
                        this.nextCtx.strokeStyle = '#8B4513';
                        this.nextCtx.lineWidth = 1;
                        this.nextCtx.strokeRect(pixelX, pixelY, cellSize, cellSize);
                        
                        // Draw emoji
                        this.nextCtx.font = `${cellSize * 0.6}px Arial`;
                        this.nextCtx.textAlign = 'center';
                        this.nextCtx.textBaseline = 'middle';
                        this.nextCtx.fillStyle = '#000';
                        this.nextCtx.fillText(
                            icon.emoji,
                            pixelX + cellSize / 2,
                            pixelY + cellSize / 2
                        );
                    }
                }
            }
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        
        // Increase level and speed based on score
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.dropInterval = Math.max(200, 1000 - (this.level - 1) * 100);
        }
    }
    
    start() {
        this.gameRunning = true;
        this.paused = false;
        document.getElementById('startBtn').textContent = 'Running...';
        this.gameLoop();
    }
    
    pause() {
        this.paused = !this.paused;
        document.getElementById('pauseBtn').textContent = this.paused ? 'Resume' : 'Pause';
    }
    
    restart() {
        this.gameRunning = false;
        this.paused = false;
        this.score = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.dropTimer = 0;
        this.initializeGrid();
        this.generateNextPiece();
        this.spawnNewPiece();
        this.updateUI();
        this.render();
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('startBtn').textContent = 'Start Game';
        document.getElementById('pauseBtn').textContent = 'Pause';
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('startBtn').textContent = 'Start Game';
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update(16); // Assume 60 FPS
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    bindEvents() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning && e.code !== 'Enter') return;
            
            switch (e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.dropPiece();
                    break;
                case 'Space':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (!this.gameRunning) {
                        this.start();
                    } else {
                        this.pause();
                    }
                    break;
            }
        });
        
        // Button controls
        document.getElementById('startBtn').addEventListener('click', () => {
            if (!this.gameRunning) {
                this.start();
            }
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pause();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.restart();
        });
    }
}

// Initialize game when page loads
let game;
window.addEventListener('load', () => {
    game = new AutumnBurstGame();
});