import type { DIconProps } from '../Icon';

import { LineChartOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LineChartOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
