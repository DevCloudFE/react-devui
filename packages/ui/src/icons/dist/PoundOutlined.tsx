import type { DIconProps } from '../Icon';

import { PoundOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PoundOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
