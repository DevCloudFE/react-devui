import type { DIconProps } from '../Icon';

import { LogoutOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LogoutOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
