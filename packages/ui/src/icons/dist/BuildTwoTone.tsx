import type { DIconProps } from '../Icon';

import { BuildTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BuildTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
