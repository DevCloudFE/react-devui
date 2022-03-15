import type { DIconProps } from '../Icon';

import { CodeSandboxOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CodeSandboxOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
