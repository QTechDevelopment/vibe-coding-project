/**
 * EffectsManager - handles visual effects and particles
 */

import * as THREE from 'three';
import { EasingUtils } from '../utils/EasingUtils.js';

export class EffectsManager {
    constructor(scene, audioManager) {
        this.scene = scene;
        this.audioManager = audioManager;
        
        this.particleSystems = [];
        this.activeEffects = [];
    }

    createBurstParticles(position) {
        const particleCount = 30; // Increased particle count
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        // Autumn colors for particles
        const autumnColors = [
            new THREE.Color(0xFF6B35), // Orange
            new THREE.Color(0xF7931E), // Golden
            new THREE.Color(0xFFD700), // Gold
            new THREE.Color(0xDC143C), // Crimson
            new THREE.Color(0x8B4513), // Brown
            new THREE.Color(0xFF4500), // OrangeRed
            new THREE.Color(0xDAA520), // GoldenRod
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position at burst location with slight randomness
            positions[i3] = position.x + (Math.random() - 0.5) * 0.2;
            positions[i3 + 1] = position.y + (Math.random() - 0.5) * 0.2;
            positions[i3 + 2] = position.z + (Math.random() - 0.5) * 0.2;
            
            // Enhanced velocity calculation with more natural spread
            const speed = 0.08 + Math.random() * 0.15;
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() * 0.8 + 0.1) * Math.PI; // Favor upward direction
            
            velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
            velocities[i3 + 1] = Math.cos(phi) * speed * 1.2; // Extra upward velocity
            velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
            
            // Random autumn color
            const color = autumnColors[Math.floor(Math.random() * autumnColors.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Random particle size
            sizes[i] = 0.08 + Math.random() * 0.12;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        
        // Add to active effects for updating
        this.activeEffects.push({
            type: 'particles',
            object: particles,
            life: 1.5, // Longer life for better effect
            maxLife: 1.5,
            velocities: velocities,
            initialSizes: [...sizes]
        });
    }

    createLevelUpEffect() {
        // Create multiple layered effects for a more spectacular level up
        
        // Main golden ring effect
        const ringGeometry = new THREE.RingGeometry(1.5, 2.5, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(0, 0, 5);
        this.scene.add(ring);
        
        // Secondary inner ring for extra sparkle
        const innerRingGeometry = new THREE.RingGeometry(0.8, 1.2, 24);
        const innerRingMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFF8DC,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
        innerRing.position.set(0, 0, 5.1);
        this.scene.add(innerRing);
        
        // Particle burst for sparkle effect
        this.createLevelUpParticles();
        
        this.activeEffects.push({
            type: 'levelUp',
            object: ring,
            innerRing: innerRing,
            life: 3.0, // Longer duration
            maxLife: 3.0,
            initialScale: 0.1
        });
    }

    createLevelUpParticles() {
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        // Golden colors for level up
        const goldColors = [
            new THREE.Color(0xFFD700), // Gold
            new THREE.Color(0xFFF8DC), // Cornsilk
            new THREE.Color(0xDAA520), // GoldenRod
            new THREE.Color(0xFFE4B5), // Moccasin
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Start in a circle around the center
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 1 + Math.random() * 0.5;
            
            positions[i3] = Math.cos(angle) * radius * 0.5;
            positions[i3 + 1] = Math.sin(angle) * radius * 0.5;
            positions[i3 + 2] = 5 + (Math.random() - 0.5) * 0.5;
            
            // Explosive outward velocity
            const speed = 0.1 + Math.random() * 0.1;
            velocities[i3] = Math.cos(angle) * speed;
            velocities[i3 + 1] = Math.sin(angle) * speed + Math.random() * 0.05;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.05;
            
            // Golden colors
            const color = goldColors[Math.floor(Math.random() * goldColors.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        
        this.activeEffects.push({
            type: 'levelUpParticles',
            object: particles,
            life: 2.5,
            maxLife: 2.5,
            velocities: velocities
        });
    }

    update() {
        this.activeEffects = this.activeEffects.filter(effect => {
            effect.life -= 0.016; // Approximate 60fps
            
            if (effect.life <= 0) {
                this.scene.remove(effect.object);
                if (effect.object.geometry) effect.object.geometry.dispose();
                if (effect.object.material) effect.object.material.dispose();
                return false;
            }
            
            const progress = 1 - (effect.life / effect.maxLife);
            
            switch (effect.type) {
                case 'particles':
                    this.updateParticles(effect, progress);
                    break;
                case 'levelUp':
                    this.updateLevelUpEffect(effect, progress);
                    break;
                case 'levelUpParticles':
                    this.updateLevelUpParticles(effect, progress);
                    break;
            }
            
            return true;
        });
    }

    updateParticles(effect, progress) {
        const positions = effect.object.geometry.attributes.position.array;
        const velocities = effect.velocities;
        const sizes = effect.object.geometry.attributes.size?.array;
        const initialSizes = effect.initialSizes;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Apply velocity with air resistance
            const airResistance = 0.985;
            velocities[i] *= airResistance;
            velocities[i + 1] *= airResistance;
            velocities[i + 2] *= airResistance;
            
            // Apply gravity with easing
            const gravity = EasingUtils.interpolate(0, 0.008, progress, EasingUtils.easeInQuad);
            velocities[i + 1] -= gravity;
            
            // Update positions
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];
            
            // Update particle sizes if available
            if (sizes && initialSizes) {
                const sizeIndex = i / 3;
                const sizeFactor = EasingUtils.interpolate(1, 0.3, progress, EasingUtils.easeOutQuad);
                sizes[sizeIndex] = initialSizes[sizeIndex] * sizeFactor;
            }
        }
        
        effect.object.geometry.attributes.position.needsUpdate = true;
        if (sizes) {
            effect.object.geometry.attributes.size.needsUpdate = true;
        }
        
        // Fade out with smooth easing
        const opacity = EasingUtils.interpolate(1, 0, progress, EasingUtils.easeOutCubic);
        effect.object.material.opacity = opacity;
    }

    updateLevelUpEffect(effect, progress) {
        // Main ring animation with elastic scaling
        const scale = EasingUtils.interpolate(effect.initialScale, 1.5, progress, EasingUtils.easeOutElastic);
        effect.object.scale.setScalar(scale);
        
        // Inner ring with different timing
        if (effect.innerRing) {
            const innerScale = EasingUtils.interpolate(effect.initialScale * 0.8, 1.2, progress, EasingUtils.easeOutBack);
            effect.innerRing.scale.setScalar(innerScale);
            
            // Counter-rotate inner ring for dynamic effect
            effect.innerRing.rotation.z -= 0.08;
        }
        
        // Opacity fade with smooth easing
        const opacity = EasingUtils.interpolate(0.9, 0, progress, EasingUtils.easeInQuart);
        effect.object.material.opacity = opacity;
        
        if (effect.innerRing) {
            const innerOpacity = EasingUtils.interpolate(0.7, 0, progress, EasingUtils.easeInQuart);
            effect.innerRing.material.opacity = innerOpacity;
        }
        
        // Main ring rotation
        effect.object.rotation.z += 0.05;
    }

    updateLevelUpParticles(effect, progress) {
        const positions = effect.object.geometry.attributes.position.array;
        const velocities = effect.velocities;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Apply velocity with decreasing speed
            const speedFactor = EasingUtils.interpolate(1, 0.2, progress, EasingUtils.easeOutQuad);
            velocities[i] *= 0.99;
            velocities[i + 1] *= 0.99;
            velocities[i + 2] *= 0.99;
            
            positions[i] += velocities[i] * speedFactor;
            positions[i + 1] += velocities[i + 1] * speedFactor;
            positions[i + 2] += velocities[i + 2] * speedFactor;
        }
        
        effect.object.geometry.attributes.position.needsUpdate = true;
        
        // Sparkle effect with opacity
        const opacity = EasingUtils.interpolate(1, 0, progress, EasingUtils.easeOutCubic);
        effect.object.material.opacity = opacity;
    }

    dispose() {
        this.activeEffects.forEach(effect => {
            this.scene.remove(effect.object);
            if (effect.object.geometry) effect.object.geometry.dispose();
            if (effect.object.material) effect.object.material.dispose();
            
            // Clean up inner ring if it exists
            if (effect.innerRing) {
                this.scene.remove(effect.innerRing);
                if (effect.innerRing.geometry) effect.innerRing.geometry.dispose();
                if (effect.innerRing.material) effect.innerRing.material.dispose();
            }
        });
        
        this.activeEffects = [];
        this.particleSystems = [];
    }
}