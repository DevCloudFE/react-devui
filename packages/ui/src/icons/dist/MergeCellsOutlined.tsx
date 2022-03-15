import type { DIconProps } from '../Icon';

import { MergeCellsOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MergeCellsOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
