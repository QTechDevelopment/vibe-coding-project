/**
 * Block - represents individual game pieces with autumn themes
 */

import * as THREE from 'three';
import { BLOCK_TYPES } from '../config/GameConfig.js';
import { EasingUtils } from '../utils/EasingUtils.js';

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
        
        // Enhanced transition properties
        this.hoverProgress = 0;
        this.selectedProgress = 0;
        this.isHovered = false;
        this.isSelected = false;
        this.removalProgress = 0;
        this.isRemoving = false;
        
        // Original values for interpolation
        this.originalScale = 1;
        this.originalColor = null;
        
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

        // Store original color for transitions
        this.originalColor = material.color.clone();

        return material;
    }

    update() {
        this.time += 0.016; // Approximate 60fps
        
        // Update transition states
        this.updateTransitions();
        
        // Gentle rotation
        this.mesh.rotation.z += this.rotationSpeed;
        
        // Subtle bobbing animation
        const bobAmount = Math.sin(this.time * this.bobSpeed + this.bobOffset) * 0.02;
        this.mesh.position.y = this.position.y + bobAmount;
        
        // Base scale with gentle pulsing
        const basePulse = 1 + Math.sin(this.time * 0.02 + this.bobOffset) * 0.05;
        
        // Apply hover scale effect
        const hoverScale = EasingUtils.interpolate(1, 1.15, this.hoverProgress, EasingUtils.easeOutBack);
        
        // Apply selection scale effect
        const selectionScale = EasingUtils.interpolate(1, 1.25, this.selectedProgress, EasingUtils.easeOutElastic);
        
        // Apply removal scale effect
        const removalScale = EasingUtils.interpolate(1, 0, this.removalProgress, EasingUtils.easeInBack);
        
        // Combine all scale effects
        const finalScale = basePulse * hoverScale * selectionScale * removalScale;
        this.mesh.scale.setScalar(finalScale);
        
        // Update material opacity during removal
        if (this.isRemoving) {
            const opacity = EasingUtils.interpolate(0.95, 0, this.removalProgress, EasingUtils.easeOutQuad);
            this.mesh.material.opacity = opacity;
        }
    }

    updateTransitions() {
        const transitionSpeed = 0.08;
        
        // Update hover transition
        if (this.isHovered && this.hoverProgress < 1) {
            this.hoverProgress = Math.min(1, this.hoverProgress + transitionSpeed);
        } else if (!this.isHovered && this.hoverProgress > 0) {
            this.hoverProgress = Math.max(0, this.hoverProgress - transitionSpeed);
        }
        
        // Update selection transition
        if (this.isSelected && this.selectedProgress < 1) {
            this.selectedProgress = Math.min(1, this.selectedProgress + transitionSpeed);
        } else if (!this.isSelected && this.selectedProgress > 0) {
            this.selectedProgress = Math.max(0, this.selectedProgress - transitionSpeed);
        }
        
        // Update removal transition
        if (this.isRemoving && this.removalProgress < 1) {
            this.removalProgress = Math.min(1, this.removalProgress + transitionSpeed * 0.8);
        }
        
        // Update emissive color based on hover/selection states
        this.updateEmissiveColor();
    }

    updateEmissiveColor() {
        const baseEmissive = { r: 0, g: 0, b: 0 };
        const hoverEmissive = { r: 0.3, g: 0.3, b: 0.3 };
        const selectEmissive = { r: 0.5, g: 0.4, b: 0.1 };
        
        let targetEmissive = baseEmissive;
        
        if (this.selectedProgress > 0) {
            targetEmissive = EasingUtils.interpolateColor(
                baseEmissive, 
                selectEmissive, 
                this.selectedProgress, 
                EasingUtils.easeOutQuad
            );
        }
        
        if (this.hoverProgress > 0) {
            targetEmissive = EasingUtils.interpolateColor(
                targetEmissive, 
                hoverEmissive, 
                this.hoverProgress, 
                EasingUtils.easeOutQuad
            );
        }
        
        this.mesh.material.emissive.setRGB(targetEmissive.r, targetEmissive.g, targetEmissive.b);
    }

    highlight() {
        // Smooth transition to highlighted state
        this.isHovered = true;
    }

    removeHighlight() {
        // Smooth transition out of highlighted state
        this.isHovered = false;
    }

    select() {
        // Smooth transition to selected state
        this.isSelected = true;
    }

    deselect() {
        // Smooth transition out of selected state
        this.isSelected = false;
    }

    startRemoval() {
        // Begin removal animation
        this.isRemoving = true;
        this.removalProgress = 0;
    }

    isRemovalComplete() {
        return this.isRemoving && this.removalProgress >= 1;
    }

    dispose() {
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
        }
    }
}