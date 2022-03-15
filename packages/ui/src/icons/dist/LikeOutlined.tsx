import type { DIconProps } from '../Icon';

import { LikeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LikeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
