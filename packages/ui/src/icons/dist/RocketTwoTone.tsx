import type { DIconProps } from '../Icon';

import { RocketTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RocketTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
