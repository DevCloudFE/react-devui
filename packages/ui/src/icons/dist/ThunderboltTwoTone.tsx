import type { DIconProps } from '../Icon';

import { ThunderboltTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ThunderboltTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
