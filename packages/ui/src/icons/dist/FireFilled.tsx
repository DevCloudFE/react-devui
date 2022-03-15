import type { DIconProps } from '../Icon';

import { FireFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FireFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
