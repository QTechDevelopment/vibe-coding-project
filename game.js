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

// On-Screen Keyboard Implementation
class OnScreenKeyboard {
    constructor() {
        this.keyboard = document.getElementById('onScreenKeyboard');
        this.currentInput = null;
        this.isVisible = false;
        this.capsLock = false;
        this.symbolsMode = false;
        
        this.symbolsMap = {
            '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
            '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
            'q': '!', 'w': '@', 'e': '#', 'r': '$', 't': '%',
            'y': '^', 'u': '&', 'i': '*', 'o': '(', 'p': ')',
            'a': '~', 's': '`', 'd': '-', 'f': '_', 'g': '=',
            'h': '+', 'j': '[', 'k': ']', 'l': '\\',
            'z': ';', 'x': ':', 'c': "'", 'v': '"', 'b': ',',
            'n': '.', 'm': '/'
        };
        
        this.setupEventListeners();
        this.detectMobileDevice();
    }
    
    detectMobileDevice() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                         ('ontouchstart' in window) ||
                         (navigator.maxTouchPoints > 0);
        
        if (isMobile) {
            document.body.classList.add('mobile-device');
        }
        
        // Enable keyboard for all devices for demo purposes
        // In production, you might want to restrict this to mobile only
        this.enableKeyboardForInputs();
    }
    
    enableKeyboardForInputs() {
        // Find all text inputs and add event listeners
        const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea');
        
        textInputs.forEach(input => {
            // Prevent native keyboard on mobile by making input readonly initially
            input.dataset.originalReadonly = input.readOnly;
            
            input.addEventListener('focus', (e) => {
                this.showKeyboard(e.target);
            });
            
            input.addEventListener('blur', (e) => {
                // Delay hiding to allow for keyboard interactions
                setTimeout(() => {
                    if (!this.keyboard.contains(document.activeElement)) {
                        this.hideKeyboard();
                    }
                }, 100);
            });
        });
    }
    
    setupEventListeners() {
        // Keyboard key clicks
        this.keyboard.addEventListener('click', (e) => {
            if (e.target.classList.contains('key')) {
                e.preventDefault();
                this.handleKeyPress(e.target);
            }
        });
        
        // Close button
        document.getElementById('keyboardClose').addEventListener('click', () => {
            this.hideKeyboard();
        });
        
        // Prevent keyboard from hiding when clicking on it
        this.keyboard.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
        
        // Handle touch events for better mobile experience
        this.keyboard.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('key')) {
                e.target.classList.add('pressed');
            }
        });
        
        this.keyboard.addEventListener('touchend', (e) => {
            if (e.target.classList.contains('key')) {
                e.target.classList.remove('pressed');
                setTimeout(() => this.handleKeyPress(e.target), 50);
            }
        });
    }
    
    showKeyboard(inputElement) {
        this.currentInput = inputElement;
        this.isVisible = true;
        this.keyboard.classList.add('show');
        
        // Scroll the input into view above the keyboard
        setTimeout(() => {
            const keyboardHeight = this.keyboard.offsetHeight;
            const inputRect = inputElement.getBoundingClientRect();
            const scrollTop = window.pageYOffset;
            const viewportHeight = window.innerHeight;
            
            if (inputRect.bottom > viewportHeight - keyboardHeight) {
                const scrollOffset = inputRect.bottom - (viewportHeight - keyboardHeight) + 20;
                window.scrollTo({
                    top: scrollTop + scrollOffset,
                    behavior: 'smooth'
                });
            }
        }, 300);
    }
    
    hideKeyboard() {
        this.isVisible = false;
        this.keyboard.classList.remove('show');
        this.currentInput = null;
    }
    
    handleKeyPress(keyElement) {
        if (!this.currentInput) return;
        
        const key = keyElement.dataset.key;
        const currentValue = this.currentInput.value;
        const selectionStart = this.currentInput.selectionStart;
        const selectionEnd = this.currentInput.selectionEnd;
        
        // Add visual feedback
        keyElement.classList.add('pressed');
        setTimeout(() => keyElement.classList.remove('pressed'), 150);
        
        switch (key) {
            case 'backspace':
                if (selectionStart === selectionEnd) {
                    // Delete single character
                    if (selectionStart > 0) {
                        this.currentInput.value = currentValue.slice(0, selectionStart - 1) + currentValue.slice(selectionStart);
                        this.currentInput.setSelectionRange(selectionStart - 1, selectionStart - 1);
                    }
                } else {
                    // Delete selection
                    this.currentInput.value = currentValue.slice(0, selectionStart) + currentValue.slice(selectionEnd);
                    this.currentInput.setSelectionRange(selectionStart, selectionStart);
                }
                break;
                
            case 'space':
                this.insertText(' ');
                break;
                
            case 'enter':
                // Trigger enter event or form submission
                const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' });
                this.currentInput.dispatchEvent(enterEvent);
                this.hideKeyboard();
                break;
                
            case 'caps':
                this.toggleCapsLock();
                break;
                
            case 'symbols':
                this.toggleSymbolsMode();
                break;
                
            default:
                let char = key;
                
                if (this.symbolsMode && this.symbolsMap[key]) {
                    char = this.symbolsMap[key];
                } else if (this.capsLock || this.symbolsMode) {
                    char = key.toUpperCase();
                }
                
                this.insertText(char);
                break;
        }
        
        // Trigger input event for any listeners
        this.currentInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    insertText(text) {
        if (!this.currentInput) return;
        
        const currentValue = this.currentInput.value;
        const selectionStart = this.currentInput.selectionStart;
        const selectionEnd = this.currentInput.selectionEnd;
        const maxLength = this.currentInput.maxLength;
        
        // Check max length
        if (maxLength && currentValue.length >= maxLength && selectionStart === selectionEnd) {
            return;
        }
        
        const newValue = currentValue.slice(0, selectionStart) + text + currentValue.slice(selectionEnd);
        
        if (maxLength && newValue.length > maxLength) {
            return;
        }
        
        this.currentInput.value = newValue;
        const newPosition = selectionStart + text.length;
        this.currentInput.setSelectionRange(newPosition, newPosition);
    }
    
    toggleCapsLock() {
        this.capsLock = !this.capsLock;
        const capsKey = document.querySelector('[data-key="caps"]');
        capsKey.classList.toggle('active', this.capsLock);
        
        // Update all letter keys
        this.updateKeyLabels();
    }
    
    toggleSymbolsMode() {
        this.symbolsMode = !this.symbolsMode;
        const symbolsKey = document.querySelector('[data-key="symbols"]');
        symbolsKey.classList.toggle('active', this.symbolsMode);
        symbolsKey.textContent = this.symbolsMode ? 'ABC' : '!@#';
        
        this.updateKeyLabels();
    }
    
    updateKeyLabels() {
        const keys = document.querySelectorAll('.key[data-key]');
        
        keys.forEach(key => {
            const keyData = key.dataset.key;
            
            if (keyData.length === 1 && keyData.match(/[a-z0-9]/)) {
                if (this.symbolsMode && this.symbolsMap[keyData]) {
                    key.textContent = this.symbolsMap[keyData];
                } else if (this.capsLock && keyData.match(/[a-z]/)) {
                    key.textContent = keyData.toUpperCase();
                } else {
                    key.textContent = keyData.toUpperCase();
                }
            }
        });
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new AutumnBurstGame();
    window.onScreenKeyboard = new OnScreenKeyboard();
});