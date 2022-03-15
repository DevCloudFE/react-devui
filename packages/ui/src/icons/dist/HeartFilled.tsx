import type { DIconProps } from '../Icon';

import { HeartFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HeartFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
