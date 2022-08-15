import type { DIconProps } from '../Icon';

import { RocketFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RocketFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
