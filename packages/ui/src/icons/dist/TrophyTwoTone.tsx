import type { DIconProps } from '../Icon';

import { TrophyTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TrophyTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
