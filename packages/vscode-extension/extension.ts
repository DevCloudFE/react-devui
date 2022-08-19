import * as vscode from 'vscode';

import { createTerminal, getJestConfigPath } from './utils';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "react-devui" is now active!');

  const disposables = [
    vscode.commands.registerCommand('run_jest', (uri) => {
      const [jestConfigPath, folderPath] = getJestConfigPath(uri.path);
      const terminal = createTerminal('react-devui:jest');
      terminal.sendText(
        String.raw`yarn jest "${uri.path}" --config='${jestConfigPath}' --collectCoverageFrom='[".${folderPath.replace(
          /\.test\.|\.spec\./,
          '.'
        )}"]'`
      );
    }),
    vscode.commands.registerCommand('run_jest_folder', (uri) => {
      const [jestConfigPath, folderPath] = getJestConfigPath(uri.path);
      const terminal = createTerminal('react-devui:jest');
      terminal.sendText(String.raw`yarn jest "${uri.path}" --config='${jestConfigPath}' --collectCoverageFrom='[".${folderPath}/**"]'`);
    }),
  ];

  context.subscriptions.push(...disposables);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
