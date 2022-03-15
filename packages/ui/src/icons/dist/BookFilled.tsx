import type { DIconProps } from '../Icon';

import { BookFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BookFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
