import type { DIconProps } from '../Icon';

import { SubnodeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SubnodeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
