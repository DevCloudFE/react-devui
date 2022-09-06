import type { DIconProps } from '../Icon';

import { InsertRowBelowOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function InsertRowBelowOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
