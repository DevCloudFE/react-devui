import type { DIconProps } from '../Icon';

import { FastForwardFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FastForwardFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
