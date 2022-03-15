import type { DIconProps } from '../Icon';

import { ControlOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ControlOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
