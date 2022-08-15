import type { DIconProps } from '../Icon';

import { AppleOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AppleOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
