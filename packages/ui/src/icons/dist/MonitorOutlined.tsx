import type { DIconProps } from '../Icon';

import { MonitorOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MonitorOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
