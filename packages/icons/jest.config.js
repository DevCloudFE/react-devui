module.exports = {
  displayName: 'icons',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: ['!./dist/**'],
  coverageDirectory: '../../coverage/packages/icons',
};
