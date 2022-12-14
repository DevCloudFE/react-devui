import { execSync } from 'child_process';
import path from 'path';

import { outputFileSync, outputJsonSync, readFileSync } from 'fs-extra';
import inquirer from 'inquirer';

import eslintrcJson from '../.eslintrc.json';
import lernaJson from '../lerna.json';
import nxJson from '../nx.json';
import packageJson from '../package.json';
import tsconfigJson from '../tsconfig.base.json';
import workspaceJson from '../workspace.json';

const ROOT_PATH = path.join(__dirname, '..');
const VERSION = lernaJson.version;

inquirer
  .prompt([
    /* Pass your questions in here */
    {
      type: 'confirm',
      name: 'toRun',
      message: 'I hope you know what you do!!!',
      default: false,
    },
  ])
  .then((answers) => {
    // Use user feedback for... whatever!!
    if (answers.toRun) {
      console.info('Updating...');
      const eslintrcJsonPath = path.join(ROOT_PATH, '.eslintrc.json');
      eslintrcJson.overrides.forEach((_, index) => {
        if (eslintrcJson.overrides[index].rules && eslintrcJson.overrides[index].rules!['@nrwl/nx/enforce-module-boundaries']) {
          eslintrcJson.overrides[index].rules!['@nrwl/nx/enforce-module-boundaries'] = [
            'error',
            {
              enforceBuildableLibDependency: true,
              allow: [],
              depConstraints: [
                {
                  sourceTag: 'scope:platform',
                  onlyDependOnLibsWithTags: ['scope:platform'],
                },
              ],
            },
          ];
        }
      });
      outputJsonSync(eslintrcJsonPath, eslintrcJson);
      execSync(`yarn prettier ${eslintrcJsonPath} --write`);

      const lernaJsonPath = path.join(ROOT_PATH, 'lerna.json');
      lernaJson.packages = [];
      lernaJson.version = '0.0.1';
      outputJsonSync(lernaJsonPath, lernaJson);
      execSync(`yarn prettier ${lernaJsonPath} --write`);

      const nxJsonPath = path.join(ROOT_PATH, 'nx.json');
      nxJson.defaultProject = 'platform';
      outputJsonSync(nxJsonPath, nxJson);
      execSync(`yarn prettier ${nxJsonPath} --write`);

      const packageJsonPath = path.join(ROOT_PATH, 'package.json');
      for (const name of ['@ant-design/icons-svg']) {
        delete packageJson.devDependencies[name];
      }
      packageJson.devDependencies['@react-devui/hooks'] = VERSION;
      packageJson.devDependencies['@react-devui/icons'] = VERSION;
      packageJson.devDependencies['@react-devui/ui'] = VERSION;
      packageJson.devDependencies['@react-devui/utils'] = VERSION;
      outputJsonSync(packageJsonPath, packageJson);
      execSync(`yarn prettier ${packageJsonPath} --write`);

      const tsconfigJsonPath = path.join(ROOT_PATH, 'tsconfig.base.json');
      tsconfigJson.compilerOptions.paths = {} as any;
      outputJsonSync(tsconfigJsonPath, tsconfigJson);
      execSync(`yarn prettier ${tsconfigJsonPath} --write`);

      const workspaceJsonPath = path.join(ROOT_PATH, 'workspace.json');
      workspaceJson.projects = { platform: 'packages/platform' } as any;
      outputJsonSync(workspaceJsonPath, workspaceJson);
      execSync(`yarn prettier ${workspaceJsonPath} --write`);

      const webpackJsPath = path.join(ROOT_PATH, 'packages', 'platform', 'webpack.js');
      const webpackJs = readFileSync(webpackJsPath, { encoding: 'utf8' });
      outputFileSync(webpackJsPath, webpackJs.replace(/.*react-devui\/ui\/styles.*/g, ''));
      execSync(`yarn eslint ${webpackJsPath} --fix`);
    }
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });
