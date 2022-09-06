import type { DIconProps } from '../Icon';

import { FallOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FallOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
