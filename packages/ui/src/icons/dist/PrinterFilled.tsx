import type { DIconProps } from '../Icon';

import { PrinterFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PrinterFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
