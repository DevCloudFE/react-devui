import type { DIconProps } from '../Icon';

import { RiseOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RiseOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
