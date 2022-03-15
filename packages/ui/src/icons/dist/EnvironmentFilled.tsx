import type { DIconProps } from '../Icon';

import { EnvironmentFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EnvironmentFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
