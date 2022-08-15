import type { DIconProps } from '../Icon';

import { BellOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BellOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
