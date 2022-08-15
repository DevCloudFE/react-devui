import type { DIconProps } from '../Icon';

import { StrikethroughOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function StrikethroughOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
