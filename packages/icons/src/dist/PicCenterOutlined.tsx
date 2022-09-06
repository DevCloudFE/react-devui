import type { DIconProps } from '../Icon';

import { PicCenterOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PicCenterOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
