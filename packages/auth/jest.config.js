const base = require('../../jest.config.base');

module.exports = {
  ...base,
  displayName: '@dental/auth',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@dental/storage$': '<rootDir>/../storage/src/index.ts',
    '^@dental/http$': '<rootDir>/../http/src/index.ts',
  },
};
