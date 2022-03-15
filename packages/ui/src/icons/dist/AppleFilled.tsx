import type { DIconProps } from '../Icon';

import { AppleFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AppleFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
