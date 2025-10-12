/**
 * EffectsManager - handles visual effects and particles
 */

import * as THREE from 'three';

export class EffectsManager {
    constructor(scene, audioManager) {
        this.scene = scene;
        this.audioManager = audioManager;
        
        this.particleSystems = [];
        this.activeEffects = [];
    }

    createBurstParticles(position) {
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        // Autumn colors for particles
        const autumnColors = [
            new THREE.Color(0xFF6B35), // Orange
            new THREE.Color(0xF7931E), // Golden
            new THREE.Color(0xFFD700), // Gold
            new THREE.Color(0xDC143C), // Crimson
            new THREE.Color(0x8B4513), // Brown
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position at burst location
            positions[i3] = position.x;
            positions[i3 + 1] = position.y;
            positions[i3 + 2] = position.z;
            
            // Random velocity in all directions
            const speed = 0.1 + Math.random() * 0.1;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
            velocities[i3 + 1] = Math.cos(phi) * speed;
            velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
            
            // Random autumn color
            const color = autumnColors[Math.floor(Math.random() * autumnColors.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        
        // Add to active effects for updating
        this.activeEffects.push({
            type: 'particles',
            object: particles,
            life: 1.0,
            maxLife: 1.0,
            velocities: velocities
        });
    }

    createLevelUpEffect() {
        // Create a golden ring effect
        const geometry = new THREE.RingGeometry(2, 3, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(geometry, material);
        ring.position.set(0, 0, 5);
        this.scene.add(ring);
        
        this.activeEffects.push({
            type: 'levelUp',
            object: ring,
            life: 2.0,
            maxLife: 2.0,
            initialScale: 0.1
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
            }
            
            return true;
        });
    }

    updateParticles(effect, progress) {
        const positions = effect.object.geometry.attributes.position.array;
        const velocities = effect.velocities;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1] - 0.005; // Gravity
            positions[i + 2] += velocities[i + 2];
            
            // Slow down particles over time
            velocities[i] *= 0.98;
            velocities[i + 1] *= 0.98;
            velocities[i + 2] *= 0.98;
        }
        
        effect.object.geometry.attributes.position.needsUpdate = true;
        effect.object.material.opacity = 1 - progress;
    }

    updateLevelUpEffect(effect, progress) {
        const scale = effect.initialScale + progress * 2;
        effect.object.scale.setScalar(scale);
        effect.object.material.opacity = 0.8 * (1 - progress);
        effect.object.rotation.z += 0.05;
    }

    dispose() {
        this.activeEffects.forEach(effect => {
            this.scene.remove(effect.object);
            if (effect.object.geometry) effect.object.geometry.dispose();
            if (effect.object.material) effect.object.material.dispose();
        });
        
        this.activeEffects = [];
        this.particleSystems = [];
    }
}