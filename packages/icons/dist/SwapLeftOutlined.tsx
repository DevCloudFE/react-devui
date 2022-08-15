import type { DIconProps } from '../Icon';

import { SwapLeftOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SwapLeftOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
