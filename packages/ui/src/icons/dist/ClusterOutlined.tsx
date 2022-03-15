import type { DIconProps } from '../Icon';

import { ClusterOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ClusterOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
