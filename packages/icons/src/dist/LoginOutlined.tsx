import type { DIconProps } from '../Icon';

import { LoginOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LoginOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
