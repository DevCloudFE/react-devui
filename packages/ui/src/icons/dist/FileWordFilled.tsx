import type { DIconProps } from '../Icon';

import { FileWordFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileWordFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
