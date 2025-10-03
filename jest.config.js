/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  moduleNameMapper: {
    "^@/lib/(.*)$": "<rootDir>/lib/$1",          
    "^@/app/(.*)$": "<rootDir>/app/$1",          
    "^@/(.*)$": "<rootDir>/app/$1",
  },
};

module.exports = config;
