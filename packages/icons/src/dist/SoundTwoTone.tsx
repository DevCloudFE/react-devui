import type { DIconProps } from '../Icon';

import { SoundTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SoundTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
