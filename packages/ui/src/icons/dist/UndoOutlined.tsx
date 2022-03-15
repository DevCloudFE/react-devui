import type { DIconProps } from '../Icon';

import { UndoOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UndoOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
