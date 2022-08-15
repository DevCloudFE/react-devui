import type { DIconProps } from '../Icon';

import { CustomerServiceTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CustomerServiceTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
