import type { DIconProps } from '../Icon';

import { CalendarOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CalendarOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
