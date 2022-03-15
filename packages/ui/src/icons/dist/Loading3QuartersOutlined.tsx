import type { DIconProps } from '../Icon';

import { Loading3QuartersOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function Loading3QuartersOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
