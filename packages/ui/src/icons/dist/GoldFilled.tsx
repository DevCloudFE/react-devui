import type { DIconProps } from '../Icon';

import { GoldFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GoldFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
