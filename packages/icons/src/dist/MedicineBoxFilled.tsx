import type { DIconProps } from '../Icon';

import { MedicineBoxFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MedicineBoxFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
