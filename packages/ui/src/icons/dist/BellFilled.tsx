import type { DIconProps } from '../Icon';

import { BellFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BellFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
