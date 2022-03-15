import type { DIconProps } from '../Icon';

import { CarryOutFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CarryOutFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
