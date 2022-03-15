import type { DIconProps } from '../Icon';

import { AlertFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AlertFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
