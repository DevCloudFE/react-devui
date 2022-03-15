import type { DIconProps } from '../Icon';

import { VideoCameraOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function VideoCameraOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
