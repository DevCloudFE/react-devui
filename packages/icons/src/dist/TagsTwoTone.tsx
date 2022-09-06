import type { DIconProps } from '../Icon';

import { TagsTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TagsTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
