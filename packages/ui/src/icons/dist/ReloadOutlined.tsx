import type { DIconProps } from '../Icon';

import { ReloadOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ReloadOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
