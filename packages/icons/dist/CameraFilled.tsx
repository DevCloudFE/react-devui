import type { DIconProps } from '../Icon';

import { CameraFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CameraFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
