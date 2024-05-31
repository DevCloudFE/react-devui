import path from 'path';

import { outputFileSync, readdirSync, readFileSync, statSync } from 'fs-extra';
import { createStream } from 'table';

let project = process.argv.find((arg) => arg.includes('--project'));
if (project) {
  project = project.slice('--project='.length);
}
const ROOT_PATH = path.join(__dirname, '..', project ? `packages/${project}` : '.');
const OUT_FILE = 'base64.out.ts';

const table = createStream({
  columnDefault: { width: 60 },
  columnCount: 2,
  columns: [{ width: 20 }, { width: 40 }],
});

const reduceDir = (dirPath: string, paths: string[] = []) => {
  let output = '';
  const files = readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      reduceDir(filePath, [...paths, file]);
    } else if (/^base64\.[\s\S]+\.[\s\S]+$/.test(file) && file !== OUT_FILE) {
      table.write([(filePath.match(/(?<=packages\/)[\s\S]+?(?=\/)/) as string[])?.[0], file]);
      const bitmap = readFileSync(filePath, { encoding: 'base64' });
      output += String.raw`  '${file.match(/(?<=\.)[\s\S]+(?=\.)/)![0]}': '${bitmap}',
`;
    }
  }
  if (output.length > 0) {
    outputFileSync(
      path.join(dirPath, OUT_FILE),
      String.raw`/* eslint-disable */
// @ts-nocheck

export const BASE64_DATA = {
${output}};
`
    );
  }
};
reduceDir(ROOT_PATH);
