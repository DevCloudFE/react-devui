import type { DIconProps } from '../Icon';

import { StarOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function StarOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
