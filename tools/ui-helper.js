const { outputFileSync, readdirSync, statSync, readFileSync } = require('fs-extra');
const path = require('path');

const COMPONENT_DIR = path.join(__dirname, '../packages/ui/src/components');
const OUT_FILE = path.join(__dirname, '../ui-helper');

let componentConfigs = String.raw`import type {__props__
} from '../components';




export interface DComponentConfig {__configs__
}
`;
function outComponentConfigs() {
  const skip = ['root'];
  const components = readdirSync(COMPONENT_DIR);
  let props = '';
  let configs = '';
  for (const component of components) {
    if (skip.includes(component)) {
      continue;
    }

    const componentPath = path.join(COMPONENT_DIR, component);

    if (!component.startsWith('_') && statSync(componentPath).isDirectory() && readdirSync(componentPath).includes('index.ts')) {
      const content = readFileSync(path.join(componentPath, 'index.ts')).toString();
      const names = content.match(/(?<='\.\/)[A-Z][a-zA-Z]+(?=')/g);
      names.forEach((name) => {
        props += String.raw`
  D${name}Props,`;
        configs += String.raw`
  D${name}: D${name}Props;`;
      });
    }
  }

  componentConfigs = componentConfigs.replace(/__props__/g, props);
  componentConfigs = componentConfigs.replace(/__configs__/g, configs);
}

outComponentConfigs();
outputFileSync(
  OUT_FILE,
  `
${componentConfigs}
`
);
