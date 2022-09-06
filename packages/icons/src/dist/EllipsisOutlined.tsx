import type { DIconProps } from '../Icon';

import { EllipsisOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EllipsisOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
