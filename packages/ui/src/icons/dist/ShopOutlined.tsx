import type { DIconProps } from '../Icon';

import { ShopOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ShopOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
