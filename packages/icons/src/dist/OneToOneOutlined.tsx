import type { DIconProps } from '../Icon';

import { OneToOneOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function OneToOneOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
