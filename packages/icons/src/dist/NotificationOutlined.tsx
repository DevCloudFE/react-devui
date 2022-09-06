import type { DIconProps } from '../Icon';

import { NotificationOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function NotificationOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
