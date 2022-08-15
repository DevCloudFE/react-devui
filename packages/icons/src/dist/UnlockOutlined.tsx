import type { DIconProps } from '../Icon';

import { UnlockOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UnlockOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
