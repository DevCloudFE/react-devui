import type { DIconProps } from '../Icon';

import { NotificationTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function NotificationTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
