import type { DIconProps } from '../Icon';

import { PushpinFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PushpinFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
