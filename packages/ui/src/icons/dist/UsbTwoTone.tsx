import type { DIconProps } from '../Icon';

import { UsbTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UsbTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
