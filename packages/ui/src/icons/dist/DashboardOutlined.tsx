import type { DIconProps } from '../Icon';

import { DashboardOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DashboardOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
