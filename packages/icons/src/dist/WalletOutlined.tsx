import type { DIconProps } from '../Icon';

import { WalletOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function WalletOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
