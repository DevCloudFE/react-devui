import type { DIconProps } from '../Icon';

import { TrademarkCircleTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TrademarkCircleTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
