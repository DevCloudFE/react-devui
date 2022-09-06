import type { DIconProps } from '../Icon';

import { EnvironmentOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EnvironmentOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
