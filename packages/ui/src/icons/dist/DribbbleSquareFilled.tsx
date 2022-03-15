import type { DIconProps } from '../Icon';

import { DribbbleSquareFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DribbbleSquareFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
