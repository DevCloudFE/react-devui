import type { DIconProps } from '../Icon';

import { RetweetOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RetweetOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
