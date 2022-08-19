export default {
  displayName: 'ui',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverage: true,
  collectCoverageFrom: ['./components/**'],
  coverageReporters: ['clover', 'json', 'lcov', 'text'],
  coverageDirectory: '../../coverage/packages/ui',
};
