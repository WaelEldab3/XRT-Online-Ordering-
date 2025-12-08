export default {
  // Use ES modules
  preset: null,
  testEnvironment: 'node',
  
  // Transform ES modules - disable transformation for pure ES modules
  transform: {},
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Test file patterns
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
    '!**/test/**',
    '!**/coverage/**'
  ],
  
  // Setup files
  setupFilesAfterEnv: [],
  
  // Mock patterns
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  
  // Verbose output
  verbose: true
};
