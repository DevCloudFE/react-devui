import type { DIconProps } from '../Icon';

import { BoxPlotTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BoxPlotTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
