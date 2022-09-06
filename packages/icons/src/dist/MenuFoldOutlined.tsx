import type { DIconProps } from '../Icon';

import { MenuFoldOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MenuFoldOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
