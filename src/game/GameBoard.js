/**
 * GameBoard - manages the 3D game grid and block interactions
 */

import * as THREE from 'three';
import { Block } from './Block.js';
import { BLOCK_TYPES, GRID_CONFIG } from '../config/GameConfig.js';
import { EasingUtils } from '../utils/EasingUtils.js';

export class GameBoard {
    constructor(scene, effectsManager, scoreManager, audioManager) {
        this.scene = scene;
        this.effectsManager = effectsManager;
        this.scoreManager = scoreManager;
        this.audioManager = audioManager;
        
        // Grid properties
        this.width = GRID_CONFIG.WIDTH;
        this.height = GRID_CONFIG.HEIGHT;
        this.blockSize = GRID_CONFIG.BLOCK_SIZE;
        this.spacing = GRID_CONFIG.SPACING;
        
        // Game state
        this.grid = [];
        this.blocks = [];
        this.isProcessing = false;
        this.fallingBlocks = [];
        
        // Animation properties
        this.fallSpeed = 0.1;
        this.burstAnimations = [];
    }

    async init() {
        this.createGrid();
        this.fillGrid();
    }

    createGrid() {
        // Initialize empty grid
        this.grid = Array(this.height).fill(null).map(() => Array(this.width).fill(null));
        this.blocks = Array(this.height).fill(null).map(() => Array(this.width).fill(null));
    }

    fillGrid() {
        const startX = -(this.width - 1) * (this.blockSize + this.spacing) / 2;
        const startY = (this.height - 1) * (this.blockSize + this.spacing) / 2;

        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const x = startX + col * (this.blockSize + this.spacing);
                const y = startY - row * (this.blockSize + this.spacing);
                const z = 0;

                const blockType = this.getRandomBlockType();
                const block = new Block(blockType, new THREE.Vector3(x, y, z));
                
                this.grid[row][col] = blockType;
                this.blocks[row][col] = block;
                this.scene.add(block.mesh);
            }
        }
    }

    getRandomBlockType() {
        const types = Object.keys(BLOCK_TYPES);
        return types[Math.floor(Math.random() * types.length)];
    }

    update() {
        // Update falling blocks
        this.updateFallingBlocks();
        
        // Update burst animations
        this.updateBurstAnimations();
        
        // Update individual blocks
        this.blocks.forEach(row => {
            row.forEach(block => {
                if (block) block.update();
            });
        });
    }

    updateFallingBlocks() {
        if (this.fallingBlocks.length === 0) return;

        let allFallen = true;
        
        this.fallingBlocks.forEach(fallingBlock => {
            const { block, targetY, speed } = fallingBlock;
            const currentY = block.mesh.position.y;
            
            if (Math.abs(currentY - targetY) > 0.01) {
                // Enhanced falling with bounce easing
                const distance = Math.abs(currentY - targetY);
                const totalDistance = fallingBlock.startY || currentY + 10;
                const progress = 1 - (distance / totalDistance);
                
                // Use eased interpolation for smoother falling
                const easedProgress = EasingUtils.easeOutBounce(Math.min(1, Math.max(0, progress)));
                block.mesh.position.y = THREE.MathUtils.lerp(currentY, targetY, speed * 1.5);
                allFallen = false;
            } else {
                block.mesh.position.y = targetY;
                block.position.y = targetY; // Update the block's stored position too
            }
        });

        if (allFallen) {
            this.fallingBlocks = [];
            this.isProcessing = false;
            
            // Check for new matches after falling
            setTimeout(() => this.checkForMatches(), 100);
        }
    }

    updateBurstAnimations() {
        this.burstAnimations = this.burstAnimations.filter(animation => {
            animation.progress += 0.04; // Slightly slower for smoother animation
            
            if (animation.progress >= 1) {
                // Remove burst effects
                this.scene.remove(animation.effect);
                if (animation.effect.geometry) animation.effect.geometry.dispose();
                if (animation.effect.material) animation.effect.material.dispose();
                
                if (animation.ringEffect) {
                    this.scene.remove(animation.ringEffect);
                    if (animation.ringEffect.geometry) animation.ringEffect.geometry.dispose();
                    if (animation.ringEffect.material) animation.ringEffect.material.dispose();
                }
                return false;
            }
            
            // Enhanced burst effect with better easing
            const scale = EasingUtils.interpolate(1, 3, animation.progress, EasingUtils.easeOutBack);
            animation.effect.scale.setScalar(scale);
            
            // Ring effect with different scaling
            if (animation.ringEffect) {
                const ringScale = EasingUtils.interpolate(0.5, 4, animation.progress, EasingUtils.easeOutCubic);
                animation.ringEffect.scale.setScalar(ringScale);
                animation.ringEffect.rotation.z += 0.15;
                
                const ringOpacity = EasingUtils.interpolate(0.6, 0, animation.progress, EasingUtils.easeOutQuad);
                animation.ringEffect.material.opacity = ringOpacity;
            }
            
            // Smooth opacity fade
            const opacity = EasingUtils.interpolate(0.8, 0, animation.progress, EasingUtils.easeOutCubic);
            animation.effect.material.opacity = opacity;
            
            // Add rotation for more dynamic effect
            animation.effect.rotation.z += 0.1;
            
            return true;
        });
    }

    handleBlockClick(row, col) {
        if (this.isProcessing || !this.blocks[row] || !this.blocks[row][col]) return;

        const blockType = this.grid[row][col];
        const connectedBlocks = this.findConnectedBlocks(row, col, blockType);

        if (connectedBlocks.length >= 4) {
            this.burstBlocks(connectedBlocks);
        }
    }

    findConnectedBlocks(startRow, startCol, blockType, visited = new Set()) {
        const key = `${startRow},${startCol}`;
        if (visited.has(key)) return [];
        
        if (startRow < 0 || startRow >= this.height || 
            startCol < 0 || startCol >= this.width ||
            this.grid[startRow][startCol] !== blockType) {
            return [];
        }

        visited.add(key);
        const connected = [{ row: startRow, col: startCol }];

        // Check adjacent cells (4-directional)
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        directions.forEach(([dRow, dCol]) => {
            const newRow = startRow + dRow;
            const newCol = startCol + dCol;
            connected.push(...this.findConnectedBlocks(newRow, newCol, blockType, visited));
        });

        return connected;
    }

    burstBlocks(blocksToRemove) {
        this.isProcessing = true;
        
        // Calculate score
        const points = this.calculateScore(blocksToRemove.length);
        this.scoreManager.addScore(points);
        
        // Play burst sound
        this.audioManager.playSound('burst');
        
        // Start removal animations for blocks
        blocksToRemove.forEach(({ row, col }) => {
            const block = this.blocks[row][col];
            if (block) {
                // Start the block's removal animation
                block.startRemoval();
            }
        });
        
        // Create burst effects at each block position
        blocksToRemove.forEach(({ row, col }) => {
            const block = this.blocks[row][col];
            if (block) {
                this.createBurstEffect(block.mesh.position);
            }
        });

        // Wait for removal animations to complete before cleaning up
        setTimeout(() => {
            blocksToRemove.forEach(({ row, col }) => {
                const block = this.blocks[row][col];
                if (block) {
                    // Remove block from scene
                    this.scene.remove(block.mesh);
                    block.dispose();
                    
                    // Clear grid position
                    this.grid[row][col] = null;
                    this.blocks[row][col] = null;
                }
            });
            
            // Apply gravity after removal
            setTimeout(() => this.applyGravity(), 100);
        }, 400); // Wait for removal animation
    }

    createBurstEffect(position) {
        // Enhanced burst effect with multiple visual elements
        
        // Main golden sphere burst
        const geometry = new THREE.SphereGeometry(0.4, 12, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            transparent: true,
            opacity: 0.8
        });
        
        const burstEffect = new THREE.Mesh(geometry, material);
        burstEffect.position.copy(position);
        this.scene.add(burstEffect);
        
        // Add secondary ring effect for extra impact
        const ringGeometry = new THREE.RingGeometry(0.3, 0.6, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF6B35,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const ringEffect = new THREE.Mesh(ringGeometry, ringMaterial);
        ringEffect.position.copy(position);
        ringEffect.position.z += 0.1;
        this.scene.add(ringEffect);
        
        this.burstAnimations.push({
            effect: burstEffect,
            ringEffect: ringEffect,
            progress: 0
        });
        
        // Create enhanced particle effect
        this.effectsManager.createBurstParticles(position);
    }

    applyGravity() {
        const startX = -(this.width - 1) * (this.blockSize + this.spacing) / 2;
        const startY = (this.height - 1) * (this.blockSize + this.spacing) / 2;
        
        for (let col = 0; col < this.width; col++) {
            // Collect non-null blocks in this column
            const columnBlocks = [];
            const columnTypes = [];
            
            for (let row = this.height - 1; row >= 0; row--) {
                if (this.blocks[row][col]) {
                    columnBlocks.push(this.blocks[row][col]);
                    columnTypes.push(this.grid[row][col]);
                }
            }
            
            // Clear the column
            for (let row = 0; row < this.height; row++) {
                this.grid[row][col] = null;
                this.blocks[row][col] = null;
            }
            
            // Place blocks at the bottom
            for (let i = 0; i < columnBlocks.length; i++) {
                const newRow = this.height - 1 - i;
                const targetY = startY - newRow * (this.blockSize + this.spacing);
                
                this.grid[newRow][col] = columnTypes[i];
                this.blocks[newRow][col] = columnBlocks[i];
                
                // Add to falling animation with enhanced properties
                this.fallingBlocks.push({
                    block: columnBlocks[i],
                    targetY: targetY,
                    startY: columnBlocks[i].mesh.position.y,
                    speed: 0.12 + Math.random() * 0.05 // Slightly varied speed
                });
            }
            
            // Fill empty spaces with new blocks
            for (let row = 0; row < this.height - columnBlocks.length; row++) {
                const x = startX + col * (this.blockSize + this.spacing);
                const y = startY - row * (this.blockSize + this.spacing);
                const z = 0;
                
                const blockType = this.getRandomBlockType();
                const block = new Block(blockType, new THREE.Vector3(x, y + 10, z)); // Start above screen
                
                this.grid[row][col] = blockType;
                this.blocks[row][col] = block;
                this.scene.add(block.mesh);
                
                // Add to falling animation with enhanced properties
                this.fallingBlocks.push({
                    block: block,
                    targetY: y,
                    startY: y + 10,
                    speed: 0.10 + Math.random() * 0.04 // Varied falling speed for new blocks
                });
            }
        }
    }

    checkForMatches() {
        // Check if there are any possible matches of 4+ blocks
        let hasMatches = false;
        
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (this.grid[row][col]) {
                    const connected = this.findConnectedBlocks(row, col, this.grid[row][col]);
                    if (connected.length >= 4) {
                        hasMatches = true;
                        break;
                    }
                }
            }
            if (hasMatches) break;
        }
        
        if (!hasMatches) {
            // Shuffle board or add new blocks if no matches possible
            console.log('No matches available - could implement shuffle here');
        }
    }

    calculateScore(blockCount) {
        const baseScore = 100;
        const multiplier = Math.max(1, blockCount - 3);
        return baseScore * multiplier * this.scoreManager.level;
    }

    getBlockAt(row, col) {
        return this.blocks[row] && this.blocks[row][col];
    }

    dispose() {
        // Clean up all blocks
        this.blocks.forEach(row => {
            row.forEach(block => {
                if (block) {
                    this.scene.remove(block.mesh);
                    block.dispose();
                }
            });
        });
        
        // Clean up burst animations
        this.burstAnimations.forEach(animation => {
            this.scene.remove(animation.effect);
        });
        
        this.blocks = [];
        this.grid = [];
        this.burstAnimations = [];
        this.fallingBlocks = [];
    }
}