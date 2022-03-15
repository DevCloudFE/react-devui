import type { DIconProps } from '../Icon';

import { RightSquareOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RightSquareOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
