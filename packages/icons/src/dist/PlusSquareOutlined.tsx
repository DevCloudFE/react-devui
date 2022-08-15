import type { DIconProps } from '../Icon';

import { PlusSquareOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PlusSquareOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
