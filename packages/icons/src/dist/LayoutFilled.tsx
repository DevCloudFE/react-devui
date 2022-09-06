import type { DIconProps } from '../Icon';

import { LayoutFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LayoutFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
