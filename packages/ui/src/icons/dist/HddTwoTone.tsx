import type { DIconProps } from '../Icon';

import { HddTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HddTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
