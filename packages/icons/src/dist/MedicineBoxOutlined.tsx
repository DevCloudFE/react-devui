import type { DIconProps } from '../Icon';

import { MedicineBoxOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MedicineBoxOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
