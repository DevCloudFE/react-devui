import type { DIconProps } from '../Icon';

import { LockOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LockOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
