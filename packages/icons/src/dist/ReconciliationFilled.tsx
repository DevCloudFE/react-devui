import type { DIconProps } from '../Icon';

import { ReconciliationFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ReconciliationFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
