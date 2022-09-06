import type { DIconProps } from '../Icon';

import { NotificationFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function NotificationFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
