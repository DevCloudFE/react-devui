import type { DIconProps } from '../Icon';

import { VideoCameraFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function VideoCameraFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
