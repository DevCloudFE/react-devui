import type { DIconProps } from '../Icon';

import { SoundFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SoundFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
