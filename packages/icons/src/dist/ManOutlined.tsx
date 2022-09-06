import type { DIconProps } from '../Icon';

import { ManOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ManOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
