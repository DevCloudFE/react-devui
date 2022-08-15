import type { DIconProps } from '../Icon';

import { ShoppingFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ShoppingFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
