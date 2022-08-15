import type { DIconProps } from '../Icon';

import { SignalFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SignalFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
