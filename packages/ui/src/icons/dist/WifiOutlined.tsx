import type { DIconProps } from '../Icon';

import { WifiOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function WifiOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
