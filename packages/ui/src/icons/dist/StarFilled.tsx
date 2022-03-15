import type { DIconProps } from '../Icon';

import { StarFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function StarFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
