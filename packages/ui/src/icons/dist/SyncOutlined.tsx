import type { DIconProps } from '../Icon';

import { SyncOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SyncOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
