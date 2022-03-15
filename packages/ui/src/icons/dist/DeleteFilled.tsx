import type { DIconProps } from '../Icon';

import { DeleteFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DeleteFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
