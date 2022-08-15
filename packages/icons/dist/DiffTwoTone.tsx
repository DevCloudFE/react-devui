import type { DIconProps } from '../Icon';

import { DiffTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DiffTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
