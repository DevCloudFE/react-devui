import type { DIconProps } from '../Icon';

import { MehOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MehOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
