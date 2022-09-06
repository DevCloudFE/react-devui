import type { DIconProps } from '../Icon';

import { GiftFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GiftFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
