/**
 * AudioManager - handles game audio and sound effects
 */

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.masterVolume = 0.3;
        this.enabled = true;
    }

    async init() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.audioContext.destination);
            
            // Generate procedural sounds
            this.generateSounds();
            
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            this.enabled = false;
        }
    }

    generateSounds() {
        if (!this.audioContext) return;
        
        // Generate burst sound
        this.sounds.burst = this.createBurstSound();
        
        // Generate level up sound
        this.sounds.levelUp = this.createLevelUpSound();
        
        // Generate click sound
        this.sounds.click = this.createClickSound();
    }

    createBurstSound() {
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 8); // Exponential decay
            
            // Multiple frequency components for richness
            const freq1 = 800 * Math.exp(-t * 2);
            const freq2 = 400 * Math.exp(-t * 3);
            const noise = (Math.random() - 0.5) * 0.1;
            
            data[i] = (Math.sin(2 * Math.PI * freq1 * t) * 0.3 + 
                      Math.sin(2 * Math.PI * freq2 * t) * 0.2 + 
                      noise) * envelope;
        }
        
        return buffer;
    }

    createLevelUpSound() {
        const duration = 1.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 2);
            
            // Rising arpeggio
            const baseFreq = 440;
            const noteIndex = Math.floor(t * 8) % 4;
            const frequencies = [1, 1.25, 1.5, 2]; // Major chord
            const freq = baseFreq * frequencies[noteIndex];
            
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
        }
        
        return buffer;
    }

    createClickSound() {
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 20);
            
            data[i] = Math.sin(2 * Math.PI * 1000 * t) * envelope * 0.1;
        }
        
        return buffer;
    }

    playSound(soundName, volume = 1.0) {
        if (!this.enabled || !this.audioContext || !this.sounds[soundName]) return;
        
        try {
            // Resume audio context if suspended (required by some browsers)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.sounds[soundName];
            gainNode.gain.value = volume;
            
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            source.start();
            
        } catch (error) {
            console.warn('Failed to play sound:', soundName, error);
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }

    toggleEnabled() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}