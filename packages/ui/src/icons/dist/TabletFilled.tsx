import type { DIconProps } from '../Icon';

import { TabletFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TabletFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
