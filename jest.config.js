const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
    },
  },
  collectCoverage: true,
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', './'],
  testRegex: './__tests__/.*.test.(ts|tsx)$',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.style.ts',
    '!src/**/stories/**',
  ],
  moduleNameMapper: {
    '^react(.*)$': '<rootDir>/node_modules/react$1',
    '^axios$': require.resolve('axios'),
    '\\.(pdf|jpg|jpeg|png|gif|ico|xml|manifestjson|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      'identity-obj-proxy',
    '\\.(css|less)$': 'identity-obj-proxy',
    ...pathsToModuleNameMapper(compilerOptions.paths /*, { prefix: '<rootDir>/' } */),
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
