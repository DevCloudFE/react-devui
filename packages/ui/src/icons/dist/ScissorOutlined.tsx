import type { DIconProps } from '../Icon';

import { ScissorOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ScissorOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
