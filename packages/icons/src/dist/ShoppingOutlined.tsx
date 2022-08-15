import type { DIconProps } from '../Icon';

import { ShoppingOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ShoppingOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
