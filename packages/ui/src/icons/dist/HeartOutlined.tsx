import type { DIconProps } from '../Icon';

import { HeartOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HeartOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
