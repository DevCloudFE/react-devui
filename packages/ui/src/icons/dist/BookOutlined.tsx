import type { DIconProps } from '../Icon';

import { BookOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BookOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
