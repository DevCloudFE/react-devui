import type { DIconProps } from '../Icon';

import { BranchesOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BranchesOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
