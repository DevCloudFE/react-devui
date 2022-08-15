import type { DIconProps } from '../Icon';

import { WeiboOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function WeiboOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
