import type { DIconProps } from '../Icon';

import { ContainerOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ContainerOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
