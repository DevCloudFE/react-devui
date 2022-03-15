import type { DIconProps } from '../Icon';

import { PhoneTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PhoneTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
