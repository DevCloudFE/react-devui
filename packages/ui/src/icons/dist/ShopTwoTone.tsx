import type { DIconProps } from '../Icon';

import { ShopTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ShopTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
