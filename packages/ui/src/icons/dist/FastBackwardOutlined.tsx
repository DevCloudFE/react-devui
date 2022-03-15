import type { DIconProps } from '../Icon';

import { FastBackwardOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FastBackwardOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
