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
  const parametersInput = document.createElement('input');
  form.method = 'POST';
  form.action = 'https://codesandbox.io/api/v1/sandboxes/define?module=/src/Demo.tsx';
  form.target = '_blank';
  parametersInput.name = 'parameters';
  parametersInput.value = parameters;
  form.appendChild(parametersInput);
  document.body.append(form);
  form.submit();
  document.body.removeChild(form);
}
