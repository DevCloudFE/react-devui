import type { DIconProps } from '../Icon';

import { FacebookFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FacebookFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
