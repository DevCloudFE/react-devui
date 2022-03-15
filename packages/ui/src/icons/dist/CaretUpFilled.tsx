import type { DIconProps } from '../Icon';

import { CaretUpFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CaretUpFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
