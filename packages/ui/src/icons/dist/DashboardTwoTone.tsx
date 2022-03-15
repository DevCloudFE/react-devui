import type { DIconProps } from '../Icon';

import { DashboardTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DashboardTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
