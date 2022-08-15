import type { DIconProps } from '../Icon';

import { GitlabFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GitlabFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
