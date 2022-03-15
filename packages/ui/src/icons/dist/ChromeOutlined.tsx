import type { DIconProps } from '../Icon';

import { ChromeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ChromeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
