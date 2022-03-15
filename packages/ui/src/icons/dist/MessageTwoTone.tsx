import type { DIconProps } from '../Icon';

import { MessageTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MessageTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
