export default {
  testEnvironment: "node",
  collectCoverage: true,
  coverageReporters: ["text", "lcov", "html"],
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        pageTitle: "Codespace Service Test Report",
        outputPath: "test-report.html",
        includeFailureMsg: true,
        includeConsoleLog: true,
      },
    ],
  ],
};