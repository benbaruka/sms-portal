const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    "^@/(.*)$": "<rootDir>/src/$1",
    // Mock Next.js internal server modules
    "^next/dist/server/web/exports/next-response$": "<rootDir>/__mocks__/next/server.ts",
  },
  testMatch: [
    // Tous les fichiers de test pour voir ce qui passe et ce qui échoue
    "<rootDir>/__tests__/**/*.test.{ts,tsx}",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/dist/",
    "/coverage/",
    "/public/",
    ".*\\.config\\..*",
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js}",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/coverage/**",
    "!**/public/**",
    "!**/src/**/*.test.{ts,tsx,js}",
    "!**/src/app/**",
    "!**/src/components/ui/**",
    "!**/src/icons/**",
    "!**/src/layout/**",
    "!**/src/global/**",
    "!**/src/context/**",
    "!**/__tests__/**",
    "!**/*.d.ts",
  ],
  coverageProvider: "v8",
  coverageReporters: ["text", "lcov", "html"],
  testTimeout: 10000,
  maxWorkers: 3,
  verbose: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
