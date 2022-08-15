import type { DIconProps } from '../Icon';

import { LaptopOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LaptopOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
