import type { DIconProps } from '../Icon';

import { WalletFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function WalletFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
