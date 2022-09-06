import type { DIconProps } from '../Icon';

import { HourglassFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HourglassFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
