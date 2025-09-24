/**
 * Main Game class - orchestrates all game systems
 */

import * as THREE from 'three';
import { GameBoard } from './GameBoard.js';
import { InputManager } from './InputManager.js';
import { ScoreManager } from './ScoreManager.js';
import { EffectsManager } from './EffectsManager.js';
import { UIManager } from '../utils/UIManager.js';

export class Game {
    constructor(container, audioManager) {
        this.container = container;
        this.audioManager = audioManager;
        
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Game systems
        this.gameBoard = null;
        this.inputManager = null;
        this.scoreManager = null;
        this.effectsManager = null;
        this.uiManager = null;
        
        // Game state
        this.isRunning = false;
        this.animationId = null;
        
        // Bind methods
        this.animate = this.animate.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
    }

    async init() {
        this.initThreeJS();
        this.initLighting();
        this.initGameSystems();
        this.setupEventListeners();
        
        // Initialize game board
        await this.gameBoard.init();
    }

    initThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x2F1B14);

        // Camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 12);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        this.container.appendChild(this.renderer.domElement);
    }

    initLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xFFE4B5, 0.4);
        this.scene.add(ambientLight);

        // Main directional light (warm autumn sunlight)
        const directionalLight = new THREE.DirectionalLight(0xFFB347, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -15;
        directionalLight.shadow.camera.right = 15;
        directionalLight.shadow.camera.top = 15;
        directionalLight.shadow.camera.bottom = -15;
        this.scene.add(directionalLight);

        // Rim light for depth
        const rimLight = new THREE.DirectionalLight(0xFF6347, 0.3);
        rimLight.position.set(-5, 5, -5);
        this.scene.add(rimLight);

        // Point light for warmth
        const pointLight = new THREE.PointLight(0xFFD700, 0.5, 20);
        pointLight.position.set(0, 8, 8);
        this.scene.add(pointLight);
    }

    initGameSystems() {
        // Initialize game systems
        this.scoreManager = new ScoreManager();
        this.effectsManager = new EffectsManager(this.scene, this.audioManager);
        this.uiManager = new UIManager();
        this.gameBoard = new GameBoard(this.scene, this.effectsManager, this.scoreManager, this.audioManager);
        this.inputManager = new InputManager(this.camera, this.gameBoard, this.renderer.domElement);
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize, false);
        
        // Enhanced game events with UI animations
        this.scoreManager.on('scoreUpdate', (score) => {
            this.uiManager.updateScore(score);
        });
        
        this.scoreManager.on('levelUp', (level) => {
            this.uiManager.updateLevel(level);
            this.uiManager.showMessage(`Level ${level}!`, 2000);
            this.audioManager.playSound('levelUp');
            this.effectsManager.createLevelUpEffect();
        });
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    start() {
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    animate() {
        if (!this.isRunning) return;

        this.animationId = requestAnimationFrame(this.animate);

        // Update game systems
        this.gameBoard.update();
        this.effectsManager.update();

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.stop();
        window.removeEventListener('resize', this.onWindowResize);
        
        if (this.gameBoard) this.gameBoard.dispose();
        if (this.inputManager) this.inputManager.dispose();
        if (this.effectsManager) this.effectsManager.dispose();
        
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
    }
}