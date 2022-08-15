import type { DIconProps } from '../Icon';

import { UserOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UserOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
