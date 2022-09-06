import type { DIconProps } from '../Icon';

import { DatabaseFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DatabaseFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
