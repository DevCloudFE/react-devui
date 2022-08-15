import type { DIconProps } from '../Icon';

import { PhoneFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PhoneFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
