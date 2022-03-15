import type { DIconProps } from '../Icon';

import { AreaChartOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AreaChartOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
