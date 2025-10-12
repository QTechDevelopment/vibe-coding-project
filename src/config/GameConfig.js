/**
 * Game configuration constants
 */

export const GRID_CONFIG = {
    WIDTH: 8,
    HEIGHT: 10,
    BLOCK_SIZE: 0.8,
    SPACING: 0.2
};

export const BLOCK_TYPES = {
    leaf: {
        color: 0xFF6B35, // Vibrant orange
        name: 'Maple Leaf'
    },
    pumpkin: {
        color: 0xFF8C00, // Dark orange
        name: 'Pumpkin'
    },
    acorn: {
        color: 0x8B4513, // Saddle brown
        name: 'Acorn'
    },
    apple: {
        color: 0xDC143C, // Crimson
        name: 'Apple'
    },
    scarf: {
        color: 0xB8860B, // Dark goldenrod
        name: 'Cozy Scarf'
    }
};

export const GAME_CONFIG = {
    MIN_MATCH_SIZE: 4,
    FALL_SPEED: 0.15,
    BURST_DURATION: 0.3,
    LEVEL_UP_THRESHOLD: 1000
};

export const COLORS = {
    AUTUMN_PALETTE: {
        BURNT_ORANGE: 0xFF6B35,
        GOLDEN_YELLOW: 0xFFD700,
        DEEP_RED: 0x8B0000,
        RUSSET_BROWN: 0x8B4513,
        WARM_AMBER: 0xFFBF00,
        MAPLE_RED: 0xFF4500,
        HARVEST_GOLD: 0xDAA520,
        CINNAMON: 0xD2691E
    },
    UI: {
        TEXT_PRIMARY: 0xFFF8DC,
        TEXT_SHADOW: 0x000000,
        BACKGROUND: 0x2F1B14
    }
};