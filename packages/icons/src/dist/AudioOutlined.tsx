import type { DIconProps } from '../Icon';

import { AudioOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AudioOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
