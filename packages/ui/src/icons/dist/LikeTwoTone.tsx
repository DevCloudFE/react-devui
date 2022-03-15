import type { DIconProps } from '../Icon';

import { LikeTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LikeTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
