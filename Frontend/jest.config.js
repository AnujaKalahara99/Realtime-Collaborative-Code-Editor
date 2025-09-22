// export default {
//   testEnvironment: "node",
//   collectCoverage: true,
//   coverageReporters: ["text", "lcov"],
//   testEnvironment: 'jsdom',
//   setupFilesAfterEnv: ['C:\Users\Hp\Desktop\real time code editor\compiler\Frontend\src\setupTests.js'],
// };

export default {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};