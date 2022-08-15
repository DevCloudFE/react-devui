import type { DIconProps } from '../Icon';

import { DownSquareTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DownSquareTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
