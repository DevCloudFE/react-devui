import type { DIconProps } from '../Icon';

import { MoneyCollectTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MoneyCollectTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
