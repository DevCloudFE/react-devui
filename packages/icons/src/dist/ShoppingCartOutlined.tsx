import type { DIconProps } from '../Icon';

import { ShoppingCartOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ShoppingCartOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
