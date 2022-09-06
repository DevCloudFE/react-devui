import type { DIconProps } from '../Icon';

import { UsergroupDeleteOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UsergroupDeleteOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
