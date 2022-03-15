import type { DIconProps } from '../Icon';

import { WindowsOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function WindowsOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
