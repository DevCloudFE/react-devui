import type { DIconProps } from '../Icon';

import { CarFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CarFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
