import type { DIconProps } from '../Icon';

import { BugTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BugTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
