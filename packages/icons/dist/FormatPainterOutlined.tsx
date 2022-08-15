import type { DIconProps } from '../Icon';

import { FormatPainterOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FormatPainterOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
