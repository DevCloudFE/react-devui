import type { DIconProps } from '../Icon';

import { DollarTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DollarTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
