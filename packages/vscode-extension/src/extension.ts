import path from 'path';

import * as vscode from 'vscode';

import { createTerminal, getJestConfigPath, loopDirectory } from './utils';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "react-devui" is now active!');

  const disposables = [
    vscode.commands.registerCommand('react-devui.runJest', (uri) => {
      const jestConfigPath = getJestConfigPath(uri.path);
      const terminal = createTerminal('react-devui:jest');
      terminal.sendText(
        String.raw`yarn jest "${uri.path}" --config='${jestConfigPath}' --collectCoverageFrom='["${path
          .relative(path.dirname(jestConfigPath), uri.path)
          .replace(/\.test\.|\.spec\./, '.')}"]'`
      );
    }),
    vscode.commands.registerCommand('react-devui.runJestFolder', (uri) => {
      const jestConfigPath = getJestConfigPath(uri.path);
      const terminal = createTerminal('react-devui:jest');
      const collectCoverageFrom: string[] = [];
      loopDirectory(uri.path, (filePath) => {
        if (/\.test\.[tj]sx?$|\.spec\.[tj]sx?$/.test(path.basename(filePath))) {
          collectCoverageFrom.push(`"${path.relative(path.dirname(jestConfigPath), filePath).replace(/\.test\.|\.spec\./, '.')}"`);
        }
      });
      terminal.sendText(
        String.raw`yarn jest "${uri.path}" --config='${jestConfigPath}' --collectCoverageFrom='[${collectCoverageFrom.join()}]'`
      );
    }),
  ];

  context.subscriptions.push(...disposables);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
