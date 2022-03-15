import type { DIconProps } from '../Icon';

import { VideoCameraTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function VideoCameraTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
