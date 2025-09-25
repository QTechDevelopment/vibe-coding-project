/**
 * ScoreManager - handles scoring, levels, and game progression
 */

export class ScoreManager {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.targetScore = 1000; // Score needed for next level
        this.scoreMultiplier = 1;
        
        this.listeners = {};
    }

    addScore(points) {
        this.score += points * this.scoreMultiplier;
        this.emit('scoreUpdate', this.score);
        
        // Check for level up
        if (this.score >= this.targetScore) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.targetScore = this.level * 1000 + (this.level - 1) * 500; // Increasing difficulty
        this.scoreMultiplier = 1 + (this.level - 1) * 0.1; // 10% bonus per level
        
        this.emit('levelUp', this.level);
    }

    getScore() {
        return this.score;
    }

    getLevel() {
        return this.level;
    }

    getProgressToNextLevel() {
        const currentLevelStart = (this.level - 1) * 1000 + Math.max(0, (this.level - 2)) * 500;
        const progress = (this.score - currentLevelStart) / (this.targetScore - currentLevelStart);
        return Math.min(1, Math.max(0, progress));
    }

    reset() {
        this.score = 0;
        this.level = 1;
        this.targetScore = 1000;
        this.scoreMultiplier = 1;
        
        this.emit('scoreUpdate', this.score);
        this.emit('levelUp', this.level);
    }

    // Simple event system
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
}