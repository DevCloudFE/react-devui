import type { DIconProps } from '../Icon';

import { ColumnWidthOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ColumnWidthOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
