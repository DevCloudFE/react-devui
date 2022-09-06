import type { DIconProps } from '../Icon';

import { FileExclamationFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileExclamationFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
