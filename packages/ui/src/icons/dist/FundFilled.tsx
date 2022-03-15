import type { DIconProps } from '../Icon';

import { FundFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FundFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
