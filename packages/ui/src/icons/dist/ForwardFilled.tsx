import type { DIconProps } from '../Icon';

import { ForwardFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ForwardFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
