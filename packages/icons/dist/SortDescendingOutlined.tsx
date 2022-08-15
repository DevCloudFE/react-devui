import type { DIconProps } from '../Icon';

import { SortDescendingOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SortDescendingOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
