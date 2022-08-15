import type { DIconProps } from '../Icon';

import { BlockOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BlockOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
