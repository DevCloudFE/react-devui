import type { DIconProps } from '../Icon';

import { ZoomInOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ZoomInOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
