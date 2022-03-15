import type { DIconProps } from '../Icon';

import { CameraOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CameraOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
