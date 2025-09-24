/**
 * Vibe Coding Project - Main Entry Point
 */

function greetUser(name = 'Developer') {
    return `Hello ${name}, welcome to the vibe coding session!`;
}

function calculateSum(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Both arguments must be numbers');
    }
    return a + b;
}

function main() {
    console.log(greetUser());
    console.log('Project is running successfully!');
    
    // Example calculation
    const result = calculateSum(5, 3);
    console.log(`Example calculation: 5 + 3 = ${result}`);
}

// Export functions for testing
module.exports = {
    greetUser,
    calculateSum,
    main
};

// Run main function if this file is executed directly
if (require.main === module) {
    main();
}