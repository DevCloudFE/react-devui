const allIconDefs = require('@ant-design/icons-svg');
const { outputFile } = require('fs-extra');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../packages/icons/src/dist');

const ICON_TMP = String.raw`import type { DIconProps } from '../Icon';

import { __icon__ as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function __icon__(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
`;
const EXPORT_TMP = String.raw`export { __icon__ } from './__icon__';
`;

let indexFile = '';

Object.keys(allIconDefs).forEach((icon) => {
  indexFile += EXPORT_TMP.replace(/__icon__/g, icon);
  outputFile(path.join(OUT_DIR, `${icon}.tsx`), ICON_TMP.replace(/__icon__/g, icon));
});

outputFile(path.join(OUT_DIR, 'index.ts'), indexFile);
