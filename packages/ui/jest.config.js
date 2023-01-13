const path = require('path');

const { readdirSync, statSync } = require('fs-extra');

const collectCoverageFrom = [];
const loop = (dirPath) => {
  const files = readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      loop(filePath);
    } else if (/\.test\.[tj]sx?$|\.spec\.[tj]sx?$/.test(path.basename(filePath))) {
      collectCoverageFrom.push(path.relative(__dirname, filePath).replace(/\.test\.|\.spec\./, '.'));
    }
  }
};
loop(__dirname);

module.exports = {
  displayName: 'ui',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverage: true,
  collectCoverageFrom,
  coverageReporters: ['clover', 'json', 'lcov', 'text'],
  coverageDirectory: '../../coverage/packages/ui',
  setupFilesAfterEnv: ['./jest.setup.js'],
};
