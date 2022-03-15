import type { DIconProps } from '../Icon';

import { TableOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TableOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
