import type { DIconProps } from '../Icon';

import { HddFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HddFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
