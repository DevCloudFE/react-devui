import type { DIconProps } from '../Icon';

import { PlusOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PlusOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
