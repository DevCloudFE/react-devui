import { existsSync } from 'fs';
import path = require('path');

import * as vscode from 'vscode';

export function getCurrentWorkspaceFolderPath(): string | undefined {
  if (vscode.workspace.workspaceFolders !== undefined) {
    return vscode.workspace.workspaceFolders[0].uri.fsPath;
  } else {
    vscode.window.showErrorMessage('Working folder not found!');
  }
}

export function createTerminal(name: string) {
  const terminal = vscode.window.terminals.find((t) => t.name === name) ?? vscode.window.createTerminal(name);
  terminal.show();
  return terminal;
}

export function getJestConfigPath(targetPath: string): [string, string] {
  const currentWorkspaceFolderPath = getCurrentWorkspaceFolderPath();
  let currentPath: string = targetPath;
  if (currentWorkspaceFolderPath) {
    do {
      for (const configFilename of ['jest.config.js', 'jest.config.ts']) {
        const configPath = path.join(currentPath, configFilename);
        if (existsSync(configPath)) {
          return [configPath, targetPath.slice(currentPath.length)];
        }
      }

      currentPath = path.join(currentPath, '..');
    } while (currentPath !== currentWorkspaceFolderPath);
  }

  return ['', ''];
}
