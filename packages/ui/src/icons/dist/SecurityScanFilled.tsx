import type { DIconProps } from '../Icon';

import { SecurityScanFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SecurityScanFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
