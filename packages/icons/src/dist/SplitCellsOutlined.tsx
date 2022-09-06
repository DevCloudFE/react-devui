import type { DIconProps } from '../Icon';

import { SplitCellsOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SplitCellsOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
