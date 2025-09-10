module.exports = {
  testEnvironment: 'node',
  preset: '@shelf/jest-mongodb',
  setupFilesAfterEnv: ['./tests/setup.js'],
  globalSetup: './tests/global-setup.js',
};
