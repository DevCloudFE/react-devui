import type { DIconProps } from '../Icon';

import { UnlockFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UnlockFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
