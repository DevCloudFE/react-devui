import type { DIconProps } from '../Icon';

import { ForwardOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ForwardOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
