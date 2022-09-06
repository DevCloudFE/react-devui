import type { DIconProps } from '../Icon';

import { UsergroupAddOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UsergroupAddOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
