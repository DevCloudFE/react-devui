import type { DIconProps } from '../Icon';

import { TagOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TagOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
