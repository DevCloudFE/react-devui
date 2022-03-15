import type { DIconProps } from '../Icon';

import { RestOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RestOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
