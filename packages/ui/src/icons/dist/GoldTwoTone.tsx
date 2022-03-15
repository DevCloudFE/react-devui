import type { DIconProps } from '../Icon';

import { GoldTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GoldTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
