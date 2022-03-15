import type { DIconProps } from '../Icon';

import { SkypeFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SkypeFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
