import type { DIconProps } from '../Icon';

import { GithubFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GithubFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
