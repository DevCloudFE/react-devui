import type { DIconProps } from '../Icon';

import { NodeExpandOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function NodeExpandOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
