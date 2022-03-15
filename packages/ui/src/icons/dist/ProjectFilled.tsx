import type { DIconProps } from '../Icon';

import { ProjectFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ProjectFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
