import type { DIconProps } from '../Icon';

import { IdcardFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function IdcardFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
