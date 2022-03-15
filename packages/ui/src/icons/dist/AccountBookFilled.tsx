import type { DIconProps } from '../Icon';

import { AccountBookFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AccountBookFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
