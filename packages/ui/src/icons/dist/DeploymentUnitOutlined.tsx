import type { DIconProps } from '../Icon';

import { DeploymentUnitOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DeploymentUnitOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
