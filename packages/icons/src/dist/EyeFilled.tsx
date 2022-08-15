import type { DIconProps } from '../Icon';

import { EyeFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EyeFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
