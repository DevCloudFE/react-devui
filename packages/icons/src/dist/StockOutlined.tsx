import type { DIconProps } from '../Icon';

import { StockOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function StockOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
