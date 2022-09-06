import type { DIconProps } from '../Icon';

import { ReadFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ReadFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
