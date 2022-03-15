import type { DIconProps } from '../Icon';

import { SearchOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SearchOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
