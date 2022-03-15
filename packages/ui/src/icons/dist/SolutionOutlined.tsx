import type { DIconProps } from '../Icon';

import { SolutionOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SolutionOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
