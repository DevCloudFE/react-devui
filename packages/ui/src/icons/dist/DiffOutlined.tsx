import type { DIconProps } from '../Icon';

import { DiffOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DiffOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
