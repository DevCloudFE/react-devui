import type { DIconProps } from '../Icon';

import { DashOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DashOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
