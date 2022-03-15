import type { DIconProps } from '../Icon';

import { ContainerFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ContainerFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
