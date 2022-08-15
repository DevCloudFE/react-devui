import type { DIconProps } from '../Icon';

import { HeatMapOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HeatMapOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
