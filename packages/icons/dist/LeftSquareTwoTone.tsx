import type { DIconProps } from '../Icon';

import { LeftSquareTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LeftSquareTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
