import type { DIconProps } from '../Icon';

import { TagsFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TagsFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
