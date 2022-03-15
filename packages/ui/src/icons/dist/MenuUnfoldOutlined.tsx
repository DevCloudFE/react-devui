import type { DIconProps } from '../Icon';

import { MenuUnfoldOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MenuUnfoldOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
