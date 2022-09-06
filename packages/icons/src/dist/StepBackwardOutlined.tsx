import type { DIconProps } from '../Icon';

import { StepBackwardOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function StepBackwardOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
