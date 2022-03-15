import type { DIconProps } from '../Icon';

import { HddOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HddOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
