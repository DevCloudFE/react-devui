import type { DIconProps } from '../Icon';

import { TabletTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TabletTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
