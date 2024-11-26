const path = require('path');

module.exports = {
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  setupFilesAfterEnv: [path.resolve(__dirname, 'test/jest.setup.js')]
};