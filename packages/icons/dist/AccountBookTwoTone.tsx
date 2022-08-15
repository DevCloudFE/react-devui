import type { DIconProps } from '../Icon';

import { AccountBookTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AccountBookTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
