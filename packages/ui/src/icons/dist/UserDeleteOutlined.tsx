import type { DIconProps } from '../Icon';

import { UserDeleteOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UserDeleteOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
