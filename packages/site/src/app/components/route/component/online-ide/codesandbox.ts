import { getParameters } from 'codesandbox/lib/api/define';

import AppTsx from './files/App.tsx';
import packageJsonFn from './files/codesandbox/package.json';
import tsconfigJson from './files/codesandbox/tsconfig.json';
import indexHtml from './files/index.html';
import indexTsx from './files/index.tsx';

import stylesScss from './files/styles.scss';

export function openCodeSandbox(name: string, tsxSource: string, scssSource?: string) {
  const files: any = {
    'public/index.html': {
      content: indexHtml,
    },
    'src/App.tsx': {
      content: AppTsx,
    },
    'src/Demo.tsx': {
      content: tsxSource,
    },
    'src/index.tsx': {
      content: indexTsx,
    },
    'src/styles.scss': {
      content: stylesScss,
    },
    'package.json': {
      content: packageJsonFn(name),
    },
    'tsconfig.json': {
      content: tsconfigJson,
    },
  };
  if (scssSource) {
    files['src/styles.scss'] = {
      content: `${stylesScss}
${scssSource}`,
    };
  }
  const parameters = getParameters({ files });

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://codesandbox.io/api/v1/sandboxes/define';
  form.target = '_blank';
  const parametersInput = document.createElement('input');
  parametersInput.name = 'parameters';
  parametersInput.value = parameters;
  const queryInput = document.createElement('input');
  queryInput.name = 'query';
  queryInput.value = 'module=/src/Demo.tsx';
  form.appendChild(parametersInput);
  form.appendChild(queryInput);
  document.body.append(form);
  form.submit();
  document.body.removeChild(form);
}
