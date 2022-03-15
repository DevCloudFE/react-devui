import type { DIconProps } from '../Icon';

import { RedditOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RedditOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
