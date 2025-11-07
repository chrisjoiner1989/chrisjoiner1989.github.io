module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  // Use correct Jest key: moduleNameMapper
  moduleNameMapper: {},
  // Collect coverage from project folders
  collectCoverageFrom: ["js/**/*.js", "!js/**/*.test.js"],
};
