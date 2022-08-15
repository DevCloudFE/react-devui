import type { DIconProps } from '../Icon';

import { AlertOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AlertOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
