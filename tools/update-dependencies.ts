import { exec } from 'child_process';
import path from 'path';

import { existsSync, outputJsonSync, readdirSync, readFileSync, readJsonSync, statSync } from 'fs-extra';
import isBuiltinModule from 'is-builtin-module';
import { createStream } from 'table';
import ts from 'typescript';

import packageJson from '../package.json';
import workspace from '../workspace.json';

const ROOT_PATH = path.join(__dirname, '..');
const TSCONFIG_OPTIONS = ['tsconfig.app.json', 'tsconfig.lib.json'];
const SKIP_IMPORT = ['.', 'packages', 'vscode'];

const table = createStream({
  columnDefault: { width: 50 },
  columnCount: 2,
  columns: [{ width: 40 }, { width: 10, alignment: 'center' }],
});

console.info(`Update package.json...`);

const getModuleName = (importStr: string) => {
  const arr = importStr.split('/');
  if (importStr.startsWith('@')) {
    return arr.slice(0, 2).join('/');
  } else {
    return arr[0];
  }
};

Object.entries(workspace.projects).forEach(([projectName, projectPath]) => {
  const packagePath = path.join(ROOT_PATH, projectPath, 'package.json');
  if (existsSync(packagePath)) {
    const projectPackageJson = readJsonSync(packagePath);

    const handleTS = () => {
      return new Promise<void>((resolve) => {
        TSCONFIG_OPTIONS.forEach((tsconfig) => {
          const tsconfigPath = path.join(ROOT_PATH, projectPath, tsconfig);
          if (existsSync(tsconfigPath)) {
            exec(`tsc --project ${tsconfigPath} --listFilesOnly`, (error, stdout) => {
              const tsFiles = stdout.split('\n');

              const reduceDir = (dirPath: string, paths: string[] = []) => {
                const files = readdirSync(dirPath);
                for (const file of files) {
                  const filePath = path.join(dirPath, file);
                  if (statSync(filePath).isDirectory()) {
                    reduceDir(filePath, [...paths, file]);
                  } else if (tsFiles.includes(filePath)) {
                    ts.createSourceFile(file, readFileSync(filePath).toString(), ts.ScriptTarget.Latest)
                      .getChildren()
                      .forEach((node) => {
                        node.getChildren().forEach((node) => {
                          if (node.kind === ts.SyntaxKind.ImportDeclaration) {
                            const importStr = ((node as ts.ImportDeclaration).moduleSpecifier as ts.StringLiteral).text;
                            if (!isBuiltinModule(importStr) && SKIP_IMPORT.every((skip) => !importStr.startsWith(skip))) {
                              const dependence = getModuleName(importStr);
                              projectPackageJson['dependencies'][dependence] = dependence.startsWith('@react-devui')
                                ? 'file:../' + dependence.split('/')[1]
                                : packageJson.devDependencies[dependence];
                            }
                          }
                        });
                      });
                  }
                }
              };
              reduceDir(path.join(ROOT_PATH, projectPath, 'src'));
              resolve();
            });
          }
        });
      });
    };

    const handleSCSS = () => {
      return new Promise<void>((resolve) => {
        const reduceDir = (dirPath: string, paths: string[] = []) => {
          const files = readdirSync(dirPath);
          for (const file of files) {
            const filePath = path.join(dirPath, file);
            if (statSync(filePath).isDirectory()) {
              reduceDir(filePath, [...paths, file]);
            } else if (file.endsWith('.scss')) {
              const content = readFileSync(filePath).toString();
              if (content.includes('~')) {
                const importArr = content.match(/(?<=@import ('|")~).+(?=('|"))/g);
                if (importArr) {
                  importArr.forEach((importStr) => {
                    const dependence = getModuleName(importStr);
                    projectPackageJson['dependencies'][dependence] = packageJson.devDependencies[dependence];
                  });
                }
              }
            }
          }
        };
        reduceDir(path.join(ROOT_PATH, projectPath, 'src'));
        resolve();
      });
    };

    Promise.all([handleTS(), handleSCSS()]).then(() => {
      outputJsonSync(packagePath, projectPackageJson);
      exec(`yarn prettier ${packagePath} --write`);
      exec('yarn util:sort-package-json');
      table.write([projectName, '✅']);
    });
  }
});
