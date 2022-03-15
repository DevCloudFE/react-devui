import type { DIconProps } from '../Icon';

import { EyeTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EyeTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
