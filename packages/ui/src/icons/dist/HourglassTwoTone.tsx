import type { DIconProps } from '../Icon';

import { HourglassTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HourglassTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
