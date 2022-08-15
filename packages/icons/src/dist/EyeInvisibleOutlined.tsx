import type { DIconProps } from '../Icon';

import { EyeInvisibleOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EyeInvisibleOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
