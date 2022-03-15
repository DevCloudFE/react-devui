import type { DIconProps } from '../Icon';

import { SecurityScanOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SecurityScanOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
