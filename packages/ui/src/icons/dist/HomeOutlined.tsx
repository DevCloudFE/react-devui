import type { DIconProps } from '../Icon';

import { HomeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HomeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
