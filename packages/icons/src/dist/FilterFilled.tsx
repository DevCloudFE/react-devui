import type { DIconProps } from '../Icon';

import { FilterFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FilterFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
