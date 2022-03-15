import type { DIconProps } from '../Icon';

import { HolderOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HolderOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
