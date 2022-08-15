import type { DIconProps } from '../Icon';

import { StopFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function StopFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
