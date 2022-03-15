import type { DIconProps } from '../Icon';

import { ControlFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ControlFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
