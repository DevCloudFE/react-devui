import type { DIconProps } from '../Icon';

import { DotChartOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DotChartOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
