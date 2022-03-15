import type { DIconProps } from '../Icon';

import { TrademarkOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TrademarkOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
