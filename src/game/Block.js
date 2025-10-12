/**
 * Block - represents individual game pieces with autumn themes
 */

import * as THREE from 'three';
import { BLOCK_TYPES } from '../config/GameConfig.js';

export class Block {
    constructor(type, position) {
        this.type = type;
        this.position = position.clone();
        this.config = BLOCK_TYPES[type];
        
        // Animation properties
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.bobSpeed = 0.03;
        this.time = 0;
        
        this.createMesh();
    }

    createMesh() {
        const geometry = this.createGeometry();
        const material = this.createMaterial();
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Store reference for raycasting
        this.mesh.userData = { block: this };
        
        // Add emoji icon sprite
        this.createIconSprite();
    }

    createGeometry() {
        switch (this.type) {
            case 'leaf':
                return this.createLeafGeometry();
            case 'pumpkin':
                return this.createPumpkinGeometry();
            case 'acorn':
                return this.createAcornGeometry();
            case 'apple':
                return this.createAppleGeometry();
            case 'scarf':
                return this.createScarfGeometry();
            default:
                return new THREE.BoxGeometry(1, 1, 0.2);
        }
    }

    createLeafGeometry() {
        // Create a leaf-like shape using a flattened sphere
        const geometry = new THREE.SphereGeometry(0.4, 8, 6);
        geometry.scale(1.2, 0.8, 0.1);
        return geometry;
    }

    createPumpkinGeometry() {
        // Create pumpkin shape using a sphere with vertical scaling
        const geometry = new THREE.SphereGeometry(0.45, 12, 8);
        geometry.scale(1, 0.8, 1);
        return geometry;
    }

    createAcornGeometry() {
        // Create acorn shape using a capsule-like geometry
        const geometry = new THREE.CapsuleGeometry(0.25, 0.4, 4, 8);
        return geometry;
    }

    createAppleGeometry() {
        // Create apple shape using a slightly flattened sphere
        const geometry = new THREE.SphereGeometry(0.4, 12, 8);
        geometry.scale(0.9, 1, 0.9);
        return geometry;
    }

    createScarfGeometry() {
        // Create scarf shape using a long, thin box
        const geometry = new THREE.BoxGeometry(1.2, 0.3, 0.15);
        return geometry;
    }

    createMaterial() {
        const config = this.config;
        
        const material = new THREE.MeshLambertMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.95
        });

        // Add some variation to the color
        const hsl = {};
        material.color.getHSL(hsl);
        hsl.l += (Math.random() - 0.5) * 0.2;
        hsl.s += (Math.random() - 0.5) * 0.1;
        material.color.setHSL(hsl.h, Math.max(0, Math.min(1, hsl.s)), Math.max(0, Math.min(1, hsl.l)));

        return material;
    }

    createIconSprite() {
        if (!this.config.icon) return;
        
        // Create canvas for emoji texture
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw emoji icon
        ctx.font = `${size * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.icon, size / 2, size / 2);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        // Create sprite material
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: true,
            depthWrite: false
        });
        
        // Create and position sprite
        this.iconSprite = new THREE.Sprite(spriteMaterial);
        this.iconSprite.scale.set(0.8, 0.8, 1);
        this.iconSprite.position.set(0, 0, 0.2); // Slightly in front of block
        
        // Add sprite to the block mesh
        this.mesh.add(this.iconSprite);
    }

    update() {
        this.time += 0.016; // Approximate 60fps
        
        // Gentle rotation
        this.mesh.rotation.z += this.rotationSpeed;
        
        // Subtle bobbing animation
        const bobAmount = Math.sin(this.time * this.bobSpeed + this.bobOffset) * 0.02;
        this.mesh.position.y = this.position.y + bobAmount;
        
        // Gentle scale pulsing for visual interest
        const scaleAmount = 1 + Math.sin(this.time * 0.02 + this.bobOffset) * 0.05;
        this.mesh.scale.setScalar(scaleAmount);
    }

    highlight() {
        // Add highlight effect when hovered
        this.mesh.material.emissive.setHex(0x444444);
    }

    removeHighlight() {
        // Remove highlight effect
        this.mesh.material.emissive.setHex(0x000000);
    }

    dispose() {
        if (this.iconSprite) {
            if (this.iconSprite.material) {
                if (this.iconSprite.material.map) {
                    this.iconSprite.material.map.dispose();
                }
                this.iconSprite.material.dispose();
            }
        }
        
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
        }
    }
}