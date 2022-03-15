import type { DIconProps } from '../Icon';

import { FunctionOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FunctionOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
