import type { DIconProps } from '../Icon';

import { DesktopOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DesktopOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
