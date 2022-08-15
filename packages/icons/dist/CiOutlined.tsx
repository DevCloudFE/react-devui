import type { DIconProps } from '../Icon';

import { CiOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CiOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
