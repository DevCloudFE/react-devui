import type { DIconProps } from '../Icon';

import { HeartTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HeartTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
