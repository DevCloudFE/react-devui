import type { DIconProps } from '../Icon';

import { LockTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LockTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
