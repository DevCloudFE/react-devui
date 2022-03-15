import type { DIconProps } from '../Icon';

import { FileExcelFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileExcelFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
