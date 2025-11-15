// jest.config.js
module.exports = {
  // Use the preset. This will auto-start/stop MongoDB.
  preset: '@shelf/jest-mongodb',
  
  testEnvironment: 'node',
  testTimeout: 20000, // Give tests 20 seconds
};