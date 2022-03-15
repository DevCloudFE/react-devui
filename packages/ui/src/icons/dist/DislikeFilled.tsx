import type { DIconProps } from '../Icon';

import { DislikeFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DislikeFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
