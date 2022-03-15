import type { DIconProps } from '../Icon';

import { InsuranceFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function InsuranceFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
