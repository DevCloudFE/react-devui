import type { DIconProps } from '../Icon';

import { CalendarTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CalendarTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
