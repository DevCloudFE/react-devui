import type { DIconProps } from '../Icon';

import { BuildFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BuildFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
