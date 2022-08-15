import type { DIconProps } from '../Icon';

import { FontColorsOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FontColorsOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
