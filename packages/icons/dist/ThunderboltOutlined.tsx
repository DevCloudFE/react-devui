import type { DIconProps } from '../Icon';

import { ThunderboltOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ThunderboltOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
