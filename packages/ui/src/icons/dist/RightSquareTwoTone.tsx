import type { DIconProps } from '../Icon';

import { RightSquareTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RightSquareTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
