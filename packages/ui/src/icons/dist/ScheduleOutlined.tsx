import type { DIconProps } from '../Icon';

import { ScheduleOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ScheduleOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
