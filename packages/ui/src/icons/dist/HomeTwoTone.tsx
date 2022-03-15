import type { DIconProps } from '../Icon';

import { HomeTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HomeTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
