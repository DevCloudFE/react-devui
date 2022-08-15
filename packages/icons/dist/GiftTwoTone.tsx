import type { DIconProps } from '../Icon';

import { GiftTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GiftTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
