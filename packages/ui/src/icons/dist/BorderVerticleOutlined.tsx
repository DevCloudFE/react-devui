import type { DIconProps } from '../Icon';

import { BorderVerticleOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BorderVerticleOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
