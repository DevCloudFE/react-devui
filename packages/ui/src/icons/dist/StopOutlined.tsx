import type { DIconProps } from '../Icon';

import { StopOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function StopOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
