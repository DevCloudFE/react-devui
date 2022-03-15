import type { DIconProps } from '../Icon';

import { SecurityScanTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SecurityScanTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
