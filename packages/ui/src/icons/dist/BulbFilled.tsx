import type { DIconProps } from '../Icon';

import { BulbFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BulbFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
