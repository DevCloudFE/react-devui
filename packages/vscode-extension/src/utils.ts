import { readdirSync, statSync, existsSync } from 'fs';
import path from 'path';

import * as vscode from 'vscode';

export function createTerminal(name: string) {
  const terminal = vscode.window.terminals.find((t) => t.name === name) ?? vscode.window.createTerminal(name);
  terminal.show();
  return terminal;
}

export function getCurrentWorkspaceFolderPath(): string | undefined {
  if (vscode.workspace.workspaceFolders !== undefined) {
    return vscode.workspace.workspaceFolders[0].uri.fsPath;
  } else {
    vscode.window.showErrorMessage('Working folder not found!');
  }
}

export function getJestConfigPath(targetPath: string): string {
  const currentWorkspaceFolderPath = getCurrentWorkspaceFolderPath();
  let currentPath: string = targetPath;
  if (currentWorkspaceFolderPath) {
    do {
      for (const configFilename of ['jest.config.js', 'jest.config.ts']) {
        const configPath = path.join(currentPath, configFilename);
        if (existsSync(configPath)) {
          return configPath;
        }
      }

      currentPath = path.join(currentPath, '..');
    } while (currentPath !== currentWorkspaceFolderPath);
  }

  return '';
}

export function loopDirectory(targetPath: string, cb: (filePath: string) => void): void {
  const loop = (dirPath: string) => {
    const files = readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      if (statSync(filePath).isDirectory()) {
        loop(filePath);
      } else {
        cb(filePath);
      }
    }
  };
  loop(targetPath);
}
