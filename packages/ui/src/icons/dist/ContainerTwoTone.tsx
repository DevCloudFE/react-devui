import type { DIconProps } from '../Icon';

import { ContainerTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ContainerTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
