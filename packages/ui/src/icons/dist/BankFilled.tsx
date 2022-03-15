import type { DIconProps } from '../Icon';

import { BankFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BankFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
