const { greetUser, calculateSum } = require('../index');

describe('Vibe Coding Project Tests', () => {
    describe('greetUser function', () => {
        test('should greet with default name', () => {
            const result = greetUser();
            expect(result).toBe('Hello Developer, welcome to the vibe coding session!');
        });

        test('should greet with custom name', () => {
            const result = greetUser('Alice');
            expect(result).toBe('Hello Alice, welcome to the vibe coding session!');
        });

        test('should handle empty string name', () => {
            const result = greetUser('');
            expect(result).toBe('Hello , welcome to the vibe coding session!');
        });
    });

    describe('calculateSum function', () => {
        test('should add two positive numbers', () => {
            expect(calculateSum(5, 3)).toBe(8);
        });

        test('should add two negative numbers', () => {
            expect(calculateSum(-2, -3)).toBe(-5);
        });

        test('should add positive and negative numbers', () => {
            expect(calculateSum(10, -5)).toBe(5);
        });

        test('should handle zero', () => {
            expect(calculateSum(0, 5)).toBe(5);
            expect(calculateSum(5, 0)).toBe(5);
            expect(calculateSum(0, 0)).toBe(0);
        });

        test('should handle decimal numbers', () => {
            expect(calculateSum(1.5, 2.5)).toBe(4);
        });

        test('should throw error for non-number inputs', () => {
            expect(() => calculateSum('5', 3)).toThrow('Both arguments must be numbers');
            expect(() => calculateSum(5, '3')).toThrow('Both arguments must be numbers');
            expect(() => calculateSum('a', 'b')).toThrow('Both arguments must be numbers');
            expect(() => calculateSum(null, 5)).toThrow('Both arguments must be numbers');
            expect(() => calculateSum(undefined, 5)).toThrow('Both arguments must be numbers');
        });
    });
});