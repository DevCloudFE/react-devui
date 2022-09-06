import type { DIconProps } from '../Icon';

import { UsbOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UsbOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
