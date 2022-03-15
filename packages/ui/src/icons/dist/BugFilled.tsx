import type { DIconProps } from '../Icon';

import { BugFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BugFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
