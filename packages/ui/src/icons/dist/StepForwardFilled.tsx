import type { DIconProps } from '../Icon';

import { StepForwardFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function StepForwardFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
