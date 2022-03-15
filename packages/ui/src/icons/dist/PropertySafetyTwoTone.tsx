import type { DIconProps } from '../Icon';

import { PropertySafetyTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PropertySafetyTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
