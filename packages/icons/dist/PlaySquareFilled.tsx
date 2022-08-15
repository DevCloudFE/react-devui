import type { DIconProps } from '../Icon';

import { PlaySquareFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PlaySquareFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
