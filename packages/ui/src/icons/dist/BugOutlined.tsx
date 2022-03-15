import type { DIconProps } from '../Icon';

import { BugOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BugOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
