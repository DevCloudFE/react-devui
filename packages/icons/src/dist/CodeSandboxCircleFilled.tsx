import type { DIconProps } from '../Icon';

import { CodeSandboxCircleFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CodeSandboxCircleFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
