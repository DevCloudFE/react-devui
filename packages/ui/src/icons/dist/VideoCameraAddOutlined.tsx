import type { DIconProps } from '../Icon';

import { VideoCameraAddOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function VideoCameraAddOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
