import type { DIconProps } from '../Icon';

import { ProjectOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ProjectOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
