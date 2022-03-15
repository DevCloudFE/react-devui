import type { DIconProps } from '../Icon';

import { PieChartOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PieChartOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
