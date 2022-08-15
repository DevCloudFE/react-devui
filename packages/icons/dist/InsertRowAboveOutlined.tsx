import type { DIconProps } from '../Icon';

import { InsertRowAboveOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function InsertRowAboveOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
