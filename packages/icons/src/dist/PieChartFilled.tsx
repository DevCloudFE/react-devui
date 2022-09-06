import type { DIconProps } from '../Icon';

import { PieChartFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PieChartFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
