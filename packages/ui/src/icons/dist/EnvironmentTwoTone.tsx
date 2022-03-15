import type { DIconProps } from '../Icon';

import { EnvironmentTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EnvironmentTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
