'use strict';

const fs = require('fs');

const message = process.env['HUSKY_GIT_PARAMS'];
const types = ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'perf', 'test', 'revert'];
const scopes = ['hooks', 'icons', 'platform', 'site', 'ui', 'utils', 'vscode-extension'];

function parseMessage(message) {
  const PATTERN = /^(\w*)(?:\((.*)\))?!?: (.*)$/;
  const match = PATTERN.exec(message);
  if (!match) {
    return null;
  }
  return {
    type: match[1] || null,
    scope: match[2] || null,
  };
}

function getScopesRule() {
  const messages = fs.readFileSync(message, { encoding: 'utf8' });
  const parsed = parseMessage(messages.split('\n')[0]);
  if (parsed) {
    const { scope } = parsed;
    if (scope) {
      return [2, 'always', scopes];
    }
  }
  return [2, 'always', []];
}

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', types],
    'scope-enum': getScopesRule,
    'body-max-length': [0],
    'body-max-line-length': [0],
  },
};
