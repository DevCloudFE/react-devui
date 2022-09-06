import type { DIconProps } from '../Icon';

import { FunnelPlotFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FunnelPlotFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
