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
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
        }
    }
}