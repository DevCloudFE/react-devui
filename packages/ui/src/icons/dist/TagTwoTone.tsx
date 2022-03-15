import type { DIconProps } from '../Icon';

import { TagTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TagTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
