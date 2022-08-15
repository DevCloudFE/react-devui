import type { DIconProps } from '../Icon';

import { CompassFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CompassFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
