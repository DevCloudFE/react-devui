import type { DIconProps } from '../Icon';

import { BookTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BookTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
