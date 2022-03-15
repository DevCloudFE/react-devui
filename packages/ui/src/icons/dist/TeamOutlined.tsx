import type { DIconProps } from '../Icon';

import { TeamOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TeamOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
