import type { DIconProps } from '../Icon';

import { BoldOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BoldOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
