import type { DIconProps } from '../Icon';

import { FlagFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FlagFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
