import type { DIconProps } from '../Icon';

import { LockFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LockFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
