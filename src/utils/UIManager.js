/**
 * UIManager - handles UI animations and transitions
 */

export class UIManager {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.currentScore = 0;
        this.currentLevel = 1;
    }

    updateScore(newScore) {
        if (newScore !== this.currentScore) {
            this.currentScore = newScore;
            this.scoreElement.textContent = `Score: ${newScore}`;
            
            // Add update animation
            this.scoreElement.classList.add('updated');
            setTimeout(() => {
                this.scoreElement.classList.remove('updated');
            }, 300);
        }
    }

    updateLevel(newLevel) {
        if (newLevel !== this.currentLevel) {
            this.currentLevel = newLevel;
            this.levelElement.textContent = `Level: ${newLevel}`;
            
            // Add level up animation
            this.levelElement.classList.add('levelUp');
            setTimeout(() => {
                this.levelElement.classList.remove('levelUp');
            }, 600);
        }
    }

    showMessage(text, duration = 3000) {
        // Create temporary message element
        const messageElement = document.createElement('div');
        messageElement.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #FFD700;
            font-size: 32px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            z-index: 200;
            opacity: 0;
            animation: messagePopIn 0.5s ease-out forwards;
        `;
        messageElement.textContent = text;
        
        // Add animation keyframes if not already added
        if (!document.getElementById('messageAnimations')) {
            const style = document.createElement('style');
            style.id = 'messageAnimations';
            style.textContent = `
                @keyframes messagePopIn {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                    100% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                
                @keyframes messagePopOut {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.getElementById('gameContainer').appendChild(messageElement);
        
        // Remove message after duration
        setTimeout(() => {
            messageElement.style.animation = 'messagePopOut 0.5s ease-in forwards';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 500);
        }, duration);
    }
}