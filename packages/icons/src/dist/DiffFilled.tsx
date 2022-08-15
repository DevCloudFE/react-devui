import type { DIconProps } from '../Icon';

import { DiffFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DiffFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
