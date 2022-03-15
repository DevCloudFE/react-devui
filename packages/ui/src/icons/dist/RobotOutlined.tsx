import type { DIconProps } from '../Icon';

import { RobotOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RobotOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
