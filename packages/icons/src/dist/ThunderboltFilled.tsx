import type { DIconProps } from '../Icon';

import { ThunderboltFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ThunderboltFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
