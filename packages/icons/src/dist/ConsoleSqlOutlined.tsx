import type { DIconProps } from '../Icon';

import { ConsoleSqlOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ConsoleSqlOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
