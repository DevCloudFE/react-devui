import type { DIconProps } from '../Icon';

import { PropertySafetyFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PropertySafetyFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
