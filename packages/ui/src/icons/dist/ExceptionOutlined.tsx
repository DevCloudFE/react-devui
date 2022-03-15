import type { DIconProps } from '../Icon';

import { ExceptionOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ExceptionOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
