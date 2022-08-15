import type { DIconProps } from '../Icon';

import { AndroidOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AndroidOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
