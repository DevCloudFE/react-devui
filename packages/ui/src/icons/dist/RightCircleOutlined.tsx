import type { DIconProps } from '../Icon';

import { RightCircleOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RightCircleOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
