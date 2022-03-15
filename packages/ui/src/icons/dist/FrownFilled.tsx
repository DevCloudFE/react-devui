import type { DIconProps } from '../Icon';

import { FrownFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FrownFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
