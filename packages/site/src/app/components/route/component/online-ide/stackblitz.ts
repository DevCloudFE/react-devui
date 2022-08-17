import sdk from '@stackblitz/sdk';
import lernaJson from 'lerna.json';

import AppTsx from './files/App.tsx';
import indexHtml from './files/index.html';
import indexTsx from './files/index.tsx';
import packageJsonFn from './files/stackblitz/package.json';
import tsconfigJson from './files/stackblitz/tsconfig.json';
import stylesScss from './files/styles.scss';

export function openStackBlitz(name: string, tsxSource: string, scssSource?: string) {
  const [packageJson, dependencies] = packageJsonFn(name);

  const files: any = {
    'index.html': indexHtml,
    'App.tsx': AppTsx,
    'Demo.tsx': tsxSource,
    'index.tsx': indexTsx,
    'styles.scss': stylesScss,
    'package.json': packageJson,
    'tsconfig.json': tsconfigJson,
  };
  if (scssSource) {
    files['styles.scss'] = `${stylesScss}
${scssSource}`;
  }

  sdk.openProject(
    {
      title: `${name} - ${lernaJson.version}`,
      description: 'Demo of react-devui',
      template: 'create-react-app',
      files: files,
      dependencies: dependencies,
    },
    { openFile: 'Demo.tsx' }
  );
}
