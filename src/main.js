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
    }

    async init() {
        try {
            // Initialize audio manager
            this.audioManager = new AudioManager();
            await this.audioManager.init();

            // Initialize game
            this.game = new Game(document.getElementById('gameContainer'), this.audioManager);
            await this.game.init();

            // Hide loading screen
            document.getElementById('loading').style.display = 'none';
            document.getElementById('ui').style.display = 'block';
            document.getElementById('instructions').style.display = 'block';

            // Start game loop
            this.game.start();

        } catch (error) {
            console.error('Failed to initialize game:', error);
            document.getElementById('loading').textContent = 'Failed to load game. Please refresh.';
        }
    }
}

// Start the application
new App();