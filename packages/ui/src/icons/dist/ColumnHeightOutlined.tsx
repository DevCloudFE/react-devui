import type { DIconProps } from '../Icon';

import { ColumnHeightOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ColumnHeightOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
