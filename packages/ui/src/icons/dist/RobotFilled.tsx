import type { DIconProps } from '../Icon';

import { RobotFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RobotFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
