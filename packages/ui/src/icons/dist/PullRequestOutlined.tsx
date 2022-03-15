import type { DIconProps } from '../Icon';

import { PullRequestOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PullRequestOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
