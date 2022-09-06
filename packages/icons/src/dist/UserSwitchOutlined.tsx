import type { DIconProps } from '../Icon';

import { UserSwitchOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UserSwitchOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
