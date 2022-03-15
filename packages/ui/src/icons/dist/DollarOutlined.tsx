import type { DIconProps } from '../Icon';

import { DollarOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DollarOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
