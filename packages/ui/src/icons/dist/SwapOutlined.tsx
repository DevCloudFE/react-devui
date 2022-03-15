import type { DIconProps } from '../Icon';

import { SwapOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SwapOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
