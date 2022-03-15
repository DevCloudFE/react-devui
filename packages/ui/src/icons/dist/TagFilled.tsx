import type { DIconProps } from '../Icon';

import { TagFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TagFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
