export default {
  displayName: 'utils',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/utils',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
