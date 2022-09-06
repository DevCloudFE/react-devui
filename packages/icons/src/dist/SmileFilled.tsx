import type { DIconProps } from '../Icon';

import { SmileFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SmileFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
