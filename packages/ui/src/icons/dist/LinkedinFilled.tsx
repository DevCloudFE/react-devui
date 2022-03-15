import type { DIconProps } from '../Icon';

import { LinkedinFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LinkedinFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
