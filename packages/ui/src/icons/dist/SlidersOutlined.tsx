import type { DIconProps } from '../Icon';

import { SlidersOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SlidersOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
