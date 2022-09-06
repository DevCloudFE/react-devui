import type { DIconProps } from '../Icon';

import { DragOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DragOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
