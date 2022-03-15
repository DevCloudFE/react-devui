import type { DIconProps } from '../Icon';

import { AudioFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AudioFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
