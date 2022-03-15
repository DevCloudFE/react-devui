import type { DIconProps } from '../Icon';

import { UnlockTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UnlockTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
