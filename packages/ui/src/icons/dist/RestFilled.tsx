import type { DIconProps } from '../Icon';

import { RestFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RestFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
