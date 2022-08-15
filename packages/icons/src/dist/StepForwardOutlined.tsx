import type { DIconProps } from '../Icon';

import { StepForwardOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function StepForwardOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
