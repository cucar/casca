console.log('Running test script...');

// Simple test function
function add(a, b) {
    return a + b;
}

// Test the function
const result = add(5, 3);
console.log(`5 + 3 = ${result}`);

if (result === 8) {
    console.log('Test passed! ✅');
} else {
    console.log('Test failed! ❌');
    process.exit(1);
} 