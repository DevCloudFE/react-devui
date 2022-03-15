import type { DIconProps } from '../Icon';

import { StopTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function StopTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
