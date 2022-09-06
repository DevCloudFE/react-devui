import type { DIconProps } from '../Icon';

import { MenuOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MenuOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
