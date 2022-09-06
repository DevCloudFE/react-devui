import type { DIconProps } from '../Icon';

import { BoxPlotOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BoxPlotOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
