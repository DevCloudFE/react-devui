import type { DIconProps } from '../Icon';

import { CustomerServiceFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CustomerServiceFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
