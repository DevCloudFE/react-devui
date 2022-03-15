import type { DIconProps } from '../Icon';

import { EyeInvisibleFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EyeInvisibleFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
