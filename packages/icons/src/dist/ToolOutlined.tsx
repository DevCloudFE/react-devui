import type { DIconProps } from '../Icon';

import { ToolOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ToolOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
