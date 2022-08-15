import type { DIconProps } from '../Icon';

import { AudioTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AudioTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
