import type { DIconProps } from '../Icon';

import { RedditSquareFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RedditSquareFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
