import type { DIconProps } from '../Icon';

import { TabletOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TabletOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
