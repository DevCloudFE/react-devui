import type { DIconProps } from '../Icon';

import { SwitcherFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SwitcherFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
