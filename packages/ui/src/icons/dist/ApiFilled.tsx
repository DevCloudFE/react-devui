import type { DIconProps } from '../Icon';

import { ApiFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ApiFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
