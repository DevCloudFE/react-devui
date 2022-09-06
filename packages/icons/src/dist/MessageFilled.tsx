import type { DIconProps } from '../Icon';

import { MessageFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MessageFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
