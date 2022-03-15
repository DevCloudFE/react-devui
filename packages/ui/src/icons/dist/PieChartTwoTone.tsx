import type { DIconProps } from '../Icon';

import { PieChartTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PieChartTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
