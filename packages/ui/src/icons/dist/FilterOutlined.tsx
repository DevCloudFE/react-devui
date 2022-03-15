import type { DIconProps } from '../Icon';

import { FilterOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FilterOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
