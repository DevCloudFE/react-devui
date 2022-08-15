import type { DIconProps } from '../Icon';

import { UsbFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UsbFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
