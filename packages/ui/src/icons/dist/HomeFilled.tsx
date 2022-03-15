import type { DIconProps } from '../Icon';

import { HomeFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HomeFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
