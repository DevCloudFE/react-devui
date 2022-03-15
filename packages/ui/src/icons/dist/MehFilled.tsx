import type { DIconProps } from '../Icon';

import { MehFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MehFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
