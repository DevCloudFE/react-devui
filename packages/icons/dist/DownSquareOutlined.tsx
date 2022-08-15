import type { DIconProps } from '../Icon';

import { DownSquareOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DownSquareOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
