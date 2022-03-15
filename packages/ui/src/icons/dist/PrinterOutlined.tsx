import type { DIconProps } from '../Icon';

import { PrinterOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PrinterOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
