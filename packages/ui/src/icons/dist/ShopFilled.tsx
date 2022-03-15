import type { DIconProps } from '../Icon';

import { ShopFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ShopFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
