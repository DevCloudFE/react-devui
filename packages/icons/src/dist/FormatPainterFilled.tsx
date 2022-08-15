import type { DIconProps } from '../Icon';

import { FormatPainterFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FormatPainterFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
