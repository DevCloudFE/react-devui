import type { DIconProps } from '../Icon';

import { BankOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BankOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
