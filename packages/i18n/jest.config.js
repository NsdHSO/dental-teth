const base = require('../../jest.config.base');

module.exports = {
  ...base,
  displayName: '@dental/i18n',
  moduleNameMapper: {
    '^@dental/storage$': '<rootDir>/../storage/src/index.ts',
  },
};
