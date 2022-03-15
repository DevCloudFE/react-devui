import type { DIconProps } from '../Icon';

import { VerticalAlignBottomOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function VerticalAlignBottomOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
