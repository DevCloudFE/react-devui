import type { DIconProps } from '../Icon';

import { FunnelPlotTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FunnelPlotTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
