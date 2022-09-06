import type { DIconProps } from '../Icon';

import { ScheduleFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ScheduleFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
