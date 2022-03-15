import type { DIconProps } from '../Icon';

import { RollbackOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RollbackOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
