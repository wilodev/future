module.exports = {
  preset: 'jest-expo',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx', 'node'],
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/src/$1',
    '\\.png$': '<rootDir>/src/__mocks__/imageMock.js',
    '\\.m4a$': '<rootDir>/src/__mocks__/soundMock.js',
  },
  setupFilesAfterEnv: ['./jest.setup.ts'],
  clearMocks: true,
  transformIgnorePatterns: ['/node_modules/(?!react-native-reanimated)/'],
};
