import type { DIconProps } from '../Icon';

import { SortAscendingOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SortAscendingOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
