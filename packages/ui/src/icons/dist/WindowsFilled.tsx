import type { DIconProps } from '../Icon';

import { WindowsFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function WindowsFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
