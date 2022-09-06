import type { DIconProps } from '../Icon';

import { DashboardFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DashboardFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
