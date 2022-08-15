import type { DIconProps } from '../Icon';

import { SwitcherTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SwitcherTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
