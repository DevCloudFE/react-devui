import type { DIconProps } from '../Icon';

import { MedicineBoxTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MedicineBoxTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
