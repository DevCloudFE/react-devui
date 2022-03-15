import type { DIconProps } from '../Icon';

import { EditOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EditOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
