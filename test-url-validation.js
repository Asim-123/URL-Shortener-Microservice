const validUrl = require('valid-url');

console.log('Testing URL validation:');
console.log('https://freeCodeCamp.org:', validUrl.isUri('https://freeCodeCamp.org'));
console.log('https://freecodecamp.org:', validUrl.isUri('https://freecodecamp.org'));
console.log('http://www.example.com:', validUrl.isUri('http://www.example.com'));
console.log('invalid-url:', validUrl.isUri('invalid-url')); 