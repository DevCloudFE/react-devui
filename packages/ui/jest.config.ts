import path from 'path';

import { readdirSync, statSync } from 'fs-extra';

const collectCoverageFrom: string[] = [];
const loop = (dirPath: string) => {
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

export default {
  displayName: 'ui',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverage: true,
  collectCoverageFrom,
  coverageReporters: ['clover', 'json', 'lcov', 'text'],
  coverageDirectory: '../../coverage/packages/ui',
};
