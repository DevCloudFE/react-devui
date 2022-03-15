import type { DIconProps } from '../Icon';

import { VerticalAlignTopOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function VerticalAlignTopOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
