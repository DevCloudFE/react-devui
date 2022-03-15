import type { DIconProps } from '../Icon';

import { FontSizeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FontSizeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
