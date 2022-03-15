import type { DIconProps } from '../Icon';

import { LinkOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LinkOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
