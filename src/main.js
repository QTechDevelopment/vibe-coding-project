/**
 * Autumn Burst - Fall-themed 3D Puzzle Game
 * Main entry point and game initialization
 */

import { Game } from './game/Game.js';
import { AudioManager } from './audio/AudioManager.js';

class App {
    constructor() {
        this.game = null;
        this.audioManager = null;
        this.init();
        this.createFloatingLeaves();
    }

    async init() {
        try {
            // Initialize audio manager
            this.audioManager = new AudioManager();
            await this.audioManager.init();

            // Initialize game
            this.game = new Game(document.getElementById('gameContainer'), this.audioManager);
            await this.game.init();

            // Enhanced loading sequence with smooth transitions
            this.hideLoadingScreen();

        } catch (error) {
            console.error('Failed to initialize game:', error);
            document.getElementById('loading').textContent = 'Failed to load game. Please refresh.';
        }
    }

    hideLoadingScreen() {
        const loading = document.getElementById('loading');
        const ui = document.getElementById('ui');
        const instructions = document.getElementById('instructions');

        // Fade out loading screen
        loading.classList.add('fade-out');
        
        setTimeout(() => {
            loading.style.display = 'none';
            
            // Show UI elements with smooth transitions
            ui.style.display = 'block';
            instructions.style.display = 'block';
            
            // Trigger animations
            setTimeout(() => {
                ui.classList.add('visible');
                instructions.classList.add('visible');
            }, 50);
            
            // Start game loop
            this.game.start();
        }, 500);
    }

    createFloatingLeaves() {
        // Create floating autumn leaves for ambiance
        const leaves = ['🍂', '🍁', '🎃', '🌰'];
        
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance every interval
                const leaf = document.createElement('div');
                leaf.className = 'floating-leaf';
                leaf.textContent = leaves[Math.floor(Math.random() * leaves.length)];
                leaf.style.left = Math.random() * 100 + '%';
                leaf.style.animationDelay = '0s';
                leaf.style.animationDuration = (10 + Math.random() * 10) + 's';
                
                document.body.appendChild(leaf);
                
                // Remove leaf after animation
                setTimeout(() => {
                    if (leaf.parentNode) {
                        leaf.parentNode.removeChild(leaf);
                    }
                }, 20000);
            }
        }, 2000);
    }
}

// Start the application
new App();