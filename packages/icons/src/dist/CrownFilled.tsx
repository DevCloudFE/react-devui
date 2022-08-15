import type { DIconProps } from '../Icon';

import { CrownFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CrownFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
