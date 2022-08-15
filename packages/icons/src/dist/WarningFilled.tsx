import type { DIconProps } from '../Icon';

import { WarningFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function WarningFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
