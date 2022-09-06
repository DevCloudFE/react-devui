import type { DIconProps } from '../Icon';

import { ForkOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ForkOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
