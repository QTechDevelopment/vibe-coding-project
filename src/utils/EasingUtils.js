/**
 * EasingUtils - Collection of easing functions for smooth animations
 */

export class EasingUtils {
    // Basic easing functions
    static linear(t) {
        return t;
    }

    static easeInQuad(t) {
        return t * t;
    }

    static easeOutQuad(t) {
        return t * (2 - t);
    }

    static easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    static easeInCubic(t) {
        return t * t * t;
    }

    static easeOutCubic(t) {
        return (--t) * t * t + 1;
    }

    static easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    static easeInQuart(t) {
        return t * t * t * t;
    }

    static easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }

    static easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
    }

    static easeInQuint(t) {
        return t * t * t * t * t;
    }

    static easeOutQuint(t) {
        return 1 + (--t) * t * t * t * t;
    }

    static easeInOutQuint(t) {
        return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
    }

    // Bouncing effects
    static easeOutBounce(t) {
        if (t < (1 / 2.75)) {
            return 7.5625 * t * t;
        } else if (t < (2 / 2.75)) {
            return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
        } else if (t < (2.5 / 2.75)) {
            return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
        } else {
            return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
        }
    }

    static easeInBounce(t) {
        return 1 - EasingUtils.easeOutBounce(1 - t);
    }

    static easeInOutBounce(t) {
        return t < 0.5
            ? EasingUtils.easeInBounce(t * 2) / 2
            : EasingUtils.easeOutBounce(t * 2 - 1) / 2 + 0.5;
    }

    // Elastic effects
    static easeOutElastic(t) {
        if (t === 0) return 0;
        if (t === 1) return 1;
        const p = 0.3;
        const s = p / 4;
        return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
    }

    static easeInElastic(t) {
        if (t === 0) return 0;
        if (t === 1) return 1;
        const p = 0.3;
        const s = p / 4;
        return -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
    }

    static easeInOutElastic(t) {
        if (t === 0) return 0;
        if (t === 1) return 1;
        const p = 0.45;
        const s = p / 4;
        if (t < 1) {
            return -0.5 * (Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
        }
        return Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p) * 0.5 + 1;
    }

    // Back effects (overshoot)
    static easeInBack(t) {
        const s = 1.70158;
        return t * t * ((s + 1) * t - s);
    }

    static easeOutBack(t) {
        const s = 1.70158;
        return --t * t * ((s + 1) * t + s) + 1;
    }

    static easeInOutBack(t) {
        const s = 1.70158 * 1.525;
        if ((t *= 2) < 1) {
            return 0.5 * (t * t * ((s + 1) * t - s));
        }
        return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
    }

    // Custom game-specific easings
    static bounceOut(t) {
        // Smooth bounce effect for falling blocks
        return EasingUtils.easeOutBounce(t);
    }

    static smoothStep(t) {
        // Smooth interpolation with zero derivatives at endpoints
        return t * t * (3 - 2 * t);
    }

    static smootherStep(t) {
        // Even smoother interpolation with zero first and second derivatives
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    // Animation interpolation helper
    static interpolate(start, end, t, easingFunction = EasingUtils.linear) {
        const factor = easingFunction(Math.max(0, Math.min(1, t)));
        return start + (end - start) * factor;
    }

    // Vector3 interpolation helper
    static interpolateVector3(startVec, endVec, t, easingFunction = EasingUtils.linear) {
        const factor = easingFunction(Math.max(0, Math.min(1, t)));
        return {
            x: startVec.x + (endVec.x - startVec.x) * factor,
            y: startVec.y + (endVec.y - startVec.y) * factor,
            z: startVec.z + (endVec.z - startVec.z) * factor
        };
    }

    // Color interpolation helper
    static interpolateColor(startColor, endColor, t, easingFunction = EasingUtils.linear) {
        const factor = easingFunction(Math.max(0, Math.min(1, t)));
        return {
            r: startColor.r + (endColor.r - startColor.r) * factor,
            g: startColor.g + (endColor.g - startColor.g) * factor,
            b: startColor.b + (endColor.b - startColor.b) * factor
        };
    }
}