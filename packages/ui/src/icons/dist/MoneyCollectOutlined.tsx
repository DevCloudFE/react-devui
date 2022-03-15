import type { DIconProps } from '../Icon';

import { MoneyCollectOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MoneyCollectOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
