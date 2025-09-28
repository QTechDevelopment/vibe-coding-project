import './styles.css'
import { AutumnBurstGame } from './game.js'

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new AutumnBurstGame();
});