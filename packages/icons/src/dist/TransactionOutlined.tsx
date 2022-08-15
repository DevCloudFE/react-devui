import type { DIconProps } from '../Icon';

import { TransactionOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TransactionOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
