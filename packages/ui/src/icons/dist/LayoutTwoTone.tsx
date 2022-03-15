import type { DIconProps } from '../Icon';

import { LayoutTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LayoutTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
