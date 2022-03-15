import type { DIconProps } from '../Icon';

import { FastBackwardFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FastBackwardFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
