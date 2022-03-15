import type { DIconProps } from '../Icon';

import { CheckSquareOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CheckSquareOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
