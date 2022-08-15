import type { DIconProps } from '../Icon';

import { BankTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BankTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
