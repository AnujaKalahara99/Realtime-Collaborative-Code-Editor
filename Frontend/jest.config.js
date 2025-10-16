// export default {
//   testEnvironment: "node",
//   collectCoverage: true,
//   coverageReporters: ["text", "lcov"],
//   testEnvironment: 'jsdom',
//   setupFilesAfterEnv: ['C:\Users\Hp\Desktop\real time code editor\compiler\Frontend\src\setupTests.js'],
// };

// export default {
//   testEnvironment: 'jsdom',
//   collectCoverage: true,
//   coverageReporters: ['text', 'lcov'],
//   setupFiles: ['<rootDir>/jest.setup.js'],
//   setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
//   transform: {
//     '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { configFile: './babel.config.cjs' }],
//   },
//   transformIgnorePatterns: [
//     '/node_modules/(?!(babel-plugin-transform-import-meta)/)',
//   ],
// };


export default {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx|mjs)$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(babel-plugin-transform-import-meta|some-other-dependency)/)',
  ],
};