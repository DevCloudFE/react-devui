import type { DIconProps } from '../Icon';

import { ShoppingTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ShoppingTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
