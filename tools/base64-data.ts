import path from 'path';

import { outputFileSync, readdirSync, readFileSync, statSync } from 'fs-extra';

const ROOT_PATH = path.join(__dirname, '..');
const OUT_FILE = 'base64.out.ts';

const reduceDir = (dirPath: string, paths: string[] = []) => {
  let output = '';
  const files = readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      reduceDir(filePath, [...paths, file]);
    } else if (/^base64\.[\s\S]+\.[\s\S]+$/.test(file) && file !== OUT_FILE) {
      console.log(file);
      const bitmap = readFileSync(path.join(dirPath, file));
      output += String.raw`  '${file.match(/(?<=\.)[\s\S]+(?=\.)/)![0]}': '${bitmap.toString('base64')}',
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
