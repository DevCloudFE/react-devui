import type { DIconProps } from '../Icon';

import { DeleteOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DeleteOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
