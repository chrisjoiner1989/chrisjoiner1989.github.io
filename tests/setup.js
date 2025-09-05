// Jest setup file (jsdom environment). Add any globals/mocks here as needed.

// Ensure TextEncoder/TextDecoder availability in jsdom if required by libraries
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

