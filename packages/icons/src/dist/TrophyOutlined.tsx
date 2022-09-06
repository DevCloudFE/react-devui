import type { DIconProps } from '../Icon';

import { TrophyOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TrophyOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
