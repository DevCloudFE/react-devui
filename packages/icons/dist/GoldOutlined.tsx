import type { DIconProps } from '../Icon';

import { GoldOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GoldOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
