import type { DIconProps } from '../Icon';

import { ToolFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ToolFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
