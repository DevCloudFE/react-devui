import type { DIconProps } from '../Icon';

import { MessageOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MessageOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
