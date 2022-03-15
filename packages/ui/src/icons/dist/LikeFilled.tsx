import type { DIconProps } from '../Icon';

import { LikeFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LikeFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
