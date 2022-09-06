import type { DIconProps } from '../Icon';

import { TrophyFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TrophyFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
