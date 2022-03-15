import type { DIconProps } from '../Icon';

import { StepBackwardFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function StepBackwardFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
