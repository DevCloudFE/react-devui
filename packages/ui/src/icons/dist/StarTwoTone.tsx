import type { DIconProps } from '../Icon';

import { StarTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function StarTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
