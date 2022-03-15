import type { DIconProps } from '../Icon';

import { EyeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EyeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
