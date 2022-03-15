import type { DIconProps } from '../Icon';

import { ZoomOutOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ZoomOutOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
