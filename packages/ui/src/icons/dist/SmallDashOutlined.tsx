import type { DIconProps } from '../Icon';

import { SmallDashOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SmallDashOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
