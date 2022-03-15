import type { DIconProps } from '../Icon';

import { CaretLeftFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CaretLeftFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
