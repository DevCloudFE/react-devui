import type { DIconProps } from '../Icon';

import { AlertTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AlertTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
