import type { DIconProps } from '../Icon';

import { BarChartOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BarChartOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
