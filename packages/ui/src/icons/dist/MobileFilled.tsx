import type { DIconProps } from '../Icon';

import { MobileFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MobileFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
