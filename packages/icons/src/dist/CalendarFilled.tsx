import type { DIconProps } from '../Icon';

import { CalendarFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CalendarFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
