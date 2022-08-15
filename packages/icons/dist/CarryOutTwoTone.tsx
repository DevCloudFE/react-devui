import type { DIconProps } from '../Icon';

import { CarryOutTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CarryOutTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
