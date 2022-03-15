import type { DIconProps } from '../Icon';

import { InsuranceTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function InsuranceTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
