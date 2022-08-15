import type { DIconProps } from '../Icon';

import { ExclamationCircleTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ExclamationCircleTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
