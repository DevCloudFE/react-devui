import type { DIconProps } from '../Icon';

import { WalletTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function WalletTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
