import type { DIconProps } from '../Icon';

import { FastForwardOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FastForwardOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
