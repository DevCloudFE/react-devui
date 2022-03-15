import type { DIconProps } from '../Icon';

import { ToTopOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ToTopOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
