module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    // Fix key name and map to project root if used
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1'
    },
    collectCoverageFrom: [
      'js/**/*.js',
      '!js/**/*.test.js'
    ]
  };