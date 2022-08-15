import type { DIconProps } from '../Icon';

import { RightCircleTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RightCircleTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
