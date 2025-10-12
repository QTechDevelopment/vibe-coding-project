/**
 * InputManager - handles user input for both desktop and mobile
 */

import * as THREE from 'three';

export class InputManager {
    constructor(camera, gameBoard, domElement) {
        this.camera = camera;
        this.gameBoard = gameBoard;
        this.domElement = domElement;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredBlock = null;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse events
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.addEventListener('click', this.onClick.bind(this));
        
        // Touch events for mobile
        this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // Prevent context menu on right click
        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    onMouseMove(event) {
        this.updateMousePosition(event.clientX, event.clientY);
        this.handleHover();
    }

    onTouchMove(event) {
        if (event.touches.length === 1) {
            event.preventDefault();
            const touch = event.touches[0];
            this.updateMousePosition(touch.clientX, touch.clientY);
            this.handleHover();
        }
    }

    onClick(event) {
        this.updateMousePosition(event.clientX, event.clientY);
        this.handleClick();
    }

    onTouchStart(event) {
        if (event.touches.length === 1) {
            event.preventDefault();
            const touch = event.touches[0];
            this.updateMousePosition(touch.clientX, touch.clientY);
        }
    }

    onTouchEnd(event) {
        if (event.changedTouches.length === 1) {
            event.preventDefault();
            this.handleClick();
        }
    }

    updateMousePosition(clientX, clientY) {
        const rect = this.domElement.getBoundingClientRect();
        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    }

    handleHover() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Get all block meshes
        const blockMeshes = [];
        for (let row = 0; row < this.gameBoard.height; row++) {
            for (let col = 0; col < this.gameBoard.width; col++) {
                const block = this.gameBoard.getBlockAt(row, col);
                if (block && block.mesh) {
                    blockMeshes.push(block.mesh);
                }
            }
        }
        
        const intersects = this.raycaster.intersectObjects(blockMeshes);
        
        // Remove previous highlight
        if (this.hoveredBlock) {
            this.hoveredBlock.removeHighlight();
            this.hoveredBlock = null;
        }
        
        // Add new highlight
        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object;
            const block = intersectedMesh.userData.block;
            if (block) {
                block.highlight();
                this.hoveredBlock = block;
                this.domElement.style.cursor = 'pointer';
            }
        } else {
            this.domElement.style.cursor = 'default';
        }
    }

    handleClick() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Get all block meshes
        const blockMeshes = [];
        for (let row = 0; row < this.gameBoard.height; row++) {
            for (let col = 0; col < this.gameBoard.width; col++) {
                const block = this.gameBoard.getBlockAt(row, col);
                if (block && block.mesh) {
                    blockMeshes.push(block.mesh);
                }
            }
        }
        
        const intersects = this.raycaster.intersectObjects(blockMeshes);
        
        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object;
            const block = intersectedMesh.userData.block;
            
            if (block) {
                // Find the grid position of this block
                for (let row = 0; row < this.gameBoard.height; row++) {
                    for (let col = 0; col < this.gameBoard.width; col++) {
                        if (this.gameBoard.getBlockAt(row, col) === block) {
                            this.gameBoard.handleBlockClick(row, col);
                            return;
                        }
                    }
                }
            }
        }
    }

    dispose() {
        this.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('click', this.onClick);
        this.domElement.removeEventListener('touchstart', this.onTouchStart);
        this.domElement.removeEventListener('touchmove', this.onTouchMove);
        this.domElement.removeEventListener('touchend', this.onTouchEnd);
        this.domElement.removeEventListener('contextmenu', (e) => e.preventDefault());
    }
}