module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "json"],
  testMatch: ["<rootDir>/src/**/*.test.[jt]s?(x)", "<rootDir>/api/**/*.test.[jt]s?(x)"],
  clearMocks: true,
  bail: true,
  testTimeout: 10000,
  verbose: true,
  coverageThreshold: {
    "./src/CardoGuard.jsx": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    "./src/lib/cardoGuard.js": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
