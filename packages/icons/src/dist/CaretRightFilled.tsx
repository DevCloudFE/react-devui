import type { DIconProps } from '../Icon';

import { CaretRightFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CaretRightFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
