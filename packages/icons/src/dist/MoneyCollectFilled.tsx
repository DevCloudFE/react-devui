import type { DIconProps } from '../Icon';

import { MoneyCollectFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MoneyCollectFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
